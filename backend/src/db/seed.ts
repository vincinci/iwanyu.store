import { db } from '../config/neon';
import { subscriptionPlans } from './schema';

// Default subscription plans
const defaultPlans = [
  {
    id: 'basic',
    name: 'Basic Vendor',
    price: 5000, // $50.00
    features: [
      'List up to 10 products',
      'Basic analytics',
      'Standard customer support',
      '5% commission fee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Vendor',
    price: 10000, // $100.00
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority customer support',
      '3% commission fee'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Vendor',
    price: 20000, // $200.00
    features: [
      'Unlimited products',
      'Premium analytics & insights',
      'Dedicated account manager',
      '2% commission fee'
    ]
  }
];

// Seed function
async function seedDatabase() {
  console.log('Seeding database with default subscription plans...');
  
  try {
    // Insert subscription plans
    for (const plan of defaultPlans) {
      await db.insert(subscriptionPlans).values(plan).onConflictDoUpdate({
        target: subscriptionPlans.id,
        set: {
          name: plan.name,
          price: plan.price,
          features: plan.features,
          updatedAt: new Date()
        }
      });
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
