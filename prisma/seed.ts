import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password', 10)

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      name: 'Demo Student',
      password,
      role: 'STUDENT',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      name: 'Demo Owner',
      password,
      role: 'OWNER',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      password,
      role: 'ADMIN',
    },
  })

  const prop1 = await prisma.property.create({
    data: {
      name: 'Sunshine Boys Hostel',
      address: '123 College Road',
      city: 'Bangalore',
      monthlyRent: 8000,
      genderPreference: 'BOYS',
      roomType: 'DOUBLE',
      facilities: JSON.stringify(['WiFi', 'AC', 'Laundry', 'Meals']),
      foodAvailable: true,
      distance: 1.2,
      rating: 4.5,
      isVerified: 'VERIFIED',
      images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800']),
      ownerId: owner.id,
    }
  })

  const prop2 = await prisma.property.create({
    data: {
      name: 'Green Girls PG',
      address: '45 University Ave',
      city: 'Bangalore',
      monthlyRent: 6500,
      genderPreference: 'GIRLS',
      roomType: 'SINGLE',
      facilities: JSON.stringify(['WiFi', 'Security', 'Meals']),
      foodAvailable: true,
      distance: 2.5,
      rating: 4.2,
      isVerified: 'PENDING',
      images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']),
      ownerId: owner.id,
    }
  })
  
  const prop3 = await prisma.property.create({
    data: {
      name: 'Premium Co-ed Residency',
      address: '78 Tech Park Layout',
      city: 'Bangalore',
      monthlyRent: 12000,
      genderPreference: 'COED',
      roomType: 'SINGLE',
      facilities: JSON.stringify(['WiFi', 'AC', 'Laundry', 'Gym', 'Pool']),
      foodAvailable: false,
      distance: 0.5,
      rating: 4.8,
      isVerified: 'VERIFIED',
      images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55dd1b31120?auto=format&fit=crop&q=80&w=800']),
      ownerId: owner.id,
    }
  })

  await prisma.property.create({
    data: {
      name: 'Budget Boys Stay',
      address: '12 Narrow Lane',
      city: 'Bangalore',
      monthlyRent: 4000,
      genderPreference: 'BOYS',
      roomType: 'TRIPLE',
      facilities: JSON.stringify(['WiFi', 'Meals']),
      foodAvailable: true,
      distance: 3.5,
      rating: 3.8,
      isVerified: 'VERIFIED',
      images: JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800']),
      ownerId: owner.id,
    }
  });

  await prisma.property.create({
    data: {
      name: 'Luxury Girls Hostel',
      address: '99 Main Road',
      city: 'Bangalore',
      monthlyRent: 15000,
      genderPreference: 'GIRLS',
      roomType: 'SINGLE',
      facilities: JSON.stringify(['WiFi', 'AC', 'Laundry', 'Meals', 'Gym', 'Security']),
      foodAvailable: true,
      distance: 1.0,
      rating: 4.9,
      isVerified: 'VERIFIED',
      images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']),
      ownerId: owner.id,
    }
  });

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
