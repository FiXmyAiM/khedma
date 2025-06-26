import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// OpenRouter client for AI integration
const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });

    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Utility functions
const generateToken = (user, isAdmin = false) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const generateUniqueNumber = async (prefix, model) => {
  const year = new Date().getFullYear();
  const count = await model.count();
  return `${prefix}-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

// =====================
// AUTHENTICATION ROUTES
// =====================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin, true);
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user account is active
    if (user.status === 'SUSPENDED' || user.status === 'EXPIRED') {
      return res.status(401).json({ error: 'Account suspended or expired' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        plan: user.plan,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User registration (trial account)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, phone, country } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + parseInt(process.env.TRIAL_PERIOD_DAYS));

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        phone,
        country,
        status: 'TRIAL',
        trialEndsAt: trialEndDate
      }
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        plan: user.plan,
        status: user.status,
        trialEndsAt: user.trialEndsAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// ADMIN ROUTES
// =====================

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        plan: true,
        status: true,
        trialEndsAt: true,
        paidUntil: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user account and send email
app.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, company, plan, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'temp123', 10);
    
    // Set paid until date based on plan
    let paidUntil = null;
    if (plan !== 'FREE') {
      paidUntil = new Date();
      if (plan === 'VIP') {
        paidUntil.setFullYear(paidUntil.getFullYear() + 100); // Lifetime
      } else {
        paidUntil.setFullYear(paidUntil.getFullYear() + 1); // 1 year
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        plan,
        status: 'ACTIVE',
        paidUntil
      }
    });

    // Send welcome email with login credentials
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Swiver Clone - Your Account is Ready',
      html: `
        <h2>Welcome to Swiver Clone!</h2>
        <p>Hello ${firstName},</p>
        <p>Your business management account has been created successfully.</p>
        <p><strong>Login Details:</strong></p>
        <p>Email: ${email}</p>
        <p>Password: ${password || 'temp123'}</p>
        <p>Plan: ${plan}</p>
        <p><strong>Login URL:</strong> ${process.env.APP_URL}</p>
        <p>Please change your password after first login.</p>
        <p>Best regards,<br>Swiver Clone Team</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'User created and email sent successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        plan: user.plan,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status or plan
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, plan, paidUntil } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(plan && { plan }),
        ...(paidUntil && { paidUntil: new Date(paidUntil) })
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// CLIENT MANAGEMENT
// =====================

// Get all clients for user
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.client.delete({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// PRODUCT MANAGEMENT
// =====================

// Get all products for user
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// INVOICE MANAGEMENT
// =====================

// Get all invoices for user
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      include: {
        client: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { clientId, items, dueDate, notes, terms } = req.body;

    const invoiceNumber = await generateUniqueNumber('INV', prisma.invoice);
    
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    
    const processedItems = items.map(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = (itemTaxable * item.taxRate) / 100;
      const itemTotal = itemTaxable + itemTax;
      
      subtotal += itemSubtotal;
      taxAmount += itemTax;
      
      return {
        ...item,
        total: itemTotal
      };
    });

    const totalAmount = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: req.user.id,
        clientId,
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        terms,
        items: {
          create: processedItems
        }
      },
      include: {
        client: true,
        items: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// AI INTEGRATION ROUTES
// =====================

// Generate AI content
app.post('/api/ai/generate', authenticateToken, async (req, res) => {
  try {
    const { type, prompt, context } = req.body;

    let systemPrompt = '';
    let model = 'anthropic/claude-3.5-sonnet';

    switch (type) {
      case 'invoice_template':
        systemPrompt = 'You are an expert business document writer. Generate professional invoice templates with proper formatting and business terms.';
        break;
      case 'email_template':
        systemPrompt = 'You are a professional business communication expert. Generate polite, clear, and effective email templates for business purposes.';
        break;
      case 'blog_post':
        systemPrompt = 'You are a business content writer specializing in entrepreneurship, finance, and business management topics.';
        break;
      case 'financial_insights':
        systemPrompt = 'You are a financial analyst. Provide clear, actionable insights based on business data and recommend specific actions for improvement.';
        break;
      default:
        systemPrompt = 'You are a helpful business assistant.';
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt + (context ? `\n\nContext: ${context}` : '') }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;

    // Save generated content
    const aiContent = await prisma.aIGeneratedContent.create({
      data: {
        type,
        prompt,
        content,
        metadata: JSON.stringify({ model, context }),
        userId: req.user.id
      }
    });

    res.json({
      content,
      id: aiContent.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI generated content history
app.get('/api/ai/history', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.aIGeneratedContent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// DASHBOARD & ANALYTICS
// =====================

// Get dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get counts
    const totalClients = await prisma.client.count({ where: { userId } });
    const totalProducts = await prisma.product.count({ where: { userId } });
    const totalInvoices = await prisma.invoice.count({ where: { userId } });
    
    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get revenue data
    const revenue = await prisma.invoice.aggregate({
      where: {
        userId,
        status: 'PAID',
        paymentDate: { gte: thirtyDaysAgo }
      },
      _sum: { totalAmount: true }
    });

    // Get pending payments
    const pendingPayments = await prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ['SENT', 'OVERDUE'] }
      },
      _sum: { totalAmount: true }
    });

    // Get overdue invoices
    const overdueInvoices = await prisma.invoice.count({
      where: {
        userId,
        status: 'OVERDUE'
      }
    });

    res.json({
      stats: {
        totalClients,
        totalProducts,
        totalInvoices,
        monthlyRevenue: revenue._sum.totalAmount || 0,
        pendingPayments: pendingPayments._sum.totalAmount || 0,
        overdueInvoices
      },
      recentInvoices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// PAYMENT PROCESSING
// =====================

// Create payment intent
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { plan, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        plan
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { userId, plan } = paymentIntent.metadata;

      // Update user subscription
      const paidUntil = new Date();
      paidUntil.setFullYear(paidUntil.getFullYear() + 1);

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          status: 'ACTIVE',
          paidUntil
        }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'COMPLETED',
          plan,
          userId
        }
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================
// ERROR HANDLING
// =====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// =====================
// SERVER STARTUP
// =====================

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    // Create admin user if doesn't exist
    const adminExists = await prisma.admin.findUnique({
      where: { email: process.env.ADMIN_EMAIL }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await prisma.admin.create({
        data: {
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('Admin user created');
    }

    // Create test user if doesn't exist
    const testUserExists = await prisma.user.findUnique({
      where: { email: process.env.TEST_USER_EMAIL }
    });

    if (!testUserExists && process.env.TEST_USER_EMAIL) {
      const hashedPassword = await bcrypt.hash(process.env.TEST_USER_PASSWORD, 10);
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + parseInt(process.env.TRIAL_PERIOD_DAYS));
      
      await prisma.user.create({
        data: {
          email: process.env.TEST_USER_EMAIL,
          password: hashedPassword,
          firstName: process.env.TEST_USER_FIRSTNAME,
          lastName: process.env.TEST_USER_LASTNAME,
          company: process.env.TEST_USER_COMPANY,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          trialEndsAt: trialEndDate
        }
      });
      console.log('Test user created');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
