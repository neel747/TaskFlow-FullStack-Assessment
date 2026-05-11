// seed script to populate database with sample data
// run: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // create users
    const admin = await User.create({
      name: 'Santanu Chakraborty',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'admin'
    });

    const user1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@taskflow.com',
      password: 'user123',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@taskflow.com',
      password: 'user123',
      role: 'user'
    });

    const user3 = await User.create({
      name: 'Ananya Das',
      email: 'ananya@taskflow.com',
      password: 'user123',
      role: 'user'
    });

    console.log('Created users');

    // create projects
    const project1 = await Project.create({
      title: 'E-Commerce Website Redesign',
      description: 'Redesign the main shopping flow including product pages, cart, and checkout.',
      status: 'active',
      priority: 'high',
      createdBy: admin._id,
      members: [admin._id, user1._id, user2._id],
      deadline: new Date('2026-05-20')
    });

    const project2 = await Project.create({
      title: 'Mobile App API',
      description: 'Build REST API endpoints for the mobile application.',
      status: 'active',
      priority: 'medium',
      createdBy: admin._id,
      members: [admin._id, user2._id, user3._id],
      deadline: new Date('2026-06-01')
    });

    const project3 = await Project.create({
      title: 'Internal Dashboard',
      description: 'Analytics dashboard for the ops team.',
      status: 'planning',
      priority: 'low',
      createdBy: admin._id,
      members: [admin._id, user1._id],
      deadline: new Date('2026-06-15')
    });

    console.log('Created projects');

    // create tasks for project 1
    const tasks = await Task.insertMany([
      { title: 'Design product listing page', description: 'Create wireframes and final mockup for the product grid', status: 'done', priority: 'high', project: project1._id, assignedTo: user1._id, createdBy: admin._id, deadline: new Date('2026-05-12'), completedAt: new Date() },
      { title: 'Implement cart functionality', description: 'Add to cart, remove, update quantity', status: 'in-progress', priority: 'high', project: project1._id, assignedTo: user2._id, createdBy: admin._id, deadline: new Date('2026-05-14') },
      { title: 'Checkout flow UI', description: 'Multi-step checkout with address and payment forms', status: 'todo', priority: 'high', project: project1._id, assignedTo: user1._id, createdBy: admin._id, deadline: new Date('2026-05-13') },
      { title: 'Product search and filters', description: 'Search bar with category and price filters', status: 'review', priority: 'medium', project: project1._id, assignedTo: user2._id, createdBy: admin._id, deadline: new Date('2026-05-16') },
      { title: 'Responsive testing', status: 'todo', priority: 'medium', project: project1._id, assignedTo: user1._id, createdBy: admin._id, deadline: new Date('2026-05-18') },
      { title: 'Setup Stripe integration', status: 'todo', priority: 'urgent', project: project1._id, assignedTo: user2._id, createdBy: admin._id, deadline: new Date('2026-05-12') },
    ]);

    // tasks for project 2
    await Task.insertMany([
      { title: 'Setup Express project', status: 'done', priority: 'medium', project: project2._id, assignedTo: user2._id, createdBy: admin._id, deadline: new Date('2026-05-10'), completedAt: new Date() },
      { title: 'User authentication endpoints', status: 'done', priority: 'high', project: project2._id, assignedTo: user3._id, createdBy: admin._id, deadline: new Date('2026-05-12'), completedAt: new Date() },
      { title: 'Product CRUD API', status: 'in-progress', priority: 'high', project: project2._id, assignedTo: user2._id, createdBy: admin._id, deadline: new Date('2026-05-18') },
      { title: 'Order management API', status: 'todo', priority: 'medium', project: project2._id, assignedTo: user3._id, createdBy: admin._id, deadline: new Date('2026-05-25') },
      { title: 'API documentation', status: 'todo', priority: 'low', project: project2._id, assignedTo: user3._id, createdBy: admin._id, deadline: new Date('2026-05-28') },
    ]);

    // tasks for project 3
    await Task.insertMany([
      { title: 'Define dashboard metrics', status: 'in-progress', priority: 'medium', project: project3._id, assignedTo: user1._id, createdBy: admin._id, deadline: new Date('2026-06-01') },
      { title: 'Design dashboard layout', status: 'todo', priority: 'medium', project: project3._id, assignedTo: user1._id, createdBy: admin._id, deadline: new Date('2026-06-05') },
    ]);

    console.log('Created tasks');

    // add some comments
    await Comment.insertMany([
      { text: 'Mockup looks great, moving to dev now.', task: tasks[0]._id, user: admin._id },
      { text: 'I finished the Figma designs, please review.', task: tasks[0]._id, user: user1._id },
      { text: 'Cart is mostly working, need to handle edge cases for out-of-stock items.', task: tasks[1]._id, user: user2._id },
      { text: 'Should we use Stripe or Razorpay for payments?', task: tasks[5]._id, user: user2._id },
      { text: 'Let\'s go with Stripe for now, we can add Razorpay later.', task: tasks[5]._id, user: admin._id },
    ]);

    console.log('Created comments');
    console.log('\n--- Seed complete ---');
    console.log('Admin login: admin@taskflow.com / admin123');
    console.log('User login: priya@taskflow.com / user123');
    console.log('User login: rahul@taskflow.com / user123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
