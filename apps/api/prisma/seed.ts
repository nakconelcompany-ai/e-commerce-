import { PrismaClient, Role, SellerStatus, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Nuvora marketplace database seed...');

  // 1. Super Admin Account
  const adminPasswordHash = await bcrypt.hash('SuperAdmin2026!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nuvora.com' },
    update: {},
    create: {
      email: 'admin@nuvora.com',
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      phone: '+2348000000000',
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 2. Sample Seller Account
  const sellerPasswordHash = await bcrypt.hash('Seller2026!', 10);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'techstore@nuvora.com' },
    update: {},
    create: {
      email: 'techstore@nuvora.com',
      passwordHash: sellerPasswordHash,
      role: Role.SELLER,
      isEmailVerified: true,
      phone: '+2348011112222',
    },
  });

  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      businessName: 'Apex Electronics Hub',
      storeName: 'Apex Tech Hub',
      storeSlug: 'apex-tech-hub',
      contactEmail: 'contact@apextech.ng',
      contactPhone: '+2348011112222',
      businessAddress: '15 Victoria Island Blvd',
      state: 'Lagos',
      city: 'Lagos',
      onboardingStatus: SellerStatus.APPROVED,
      description: 'Authorized retailer of original smartphones, laptops, smart gadgets and electronics accessories.',
      bankAccountName: 'Apex Electronics Ltd',
      bankAccountNumber: '0123456789',
      bankCode: '058',
      bankName: 'GTBank',
    },
  });
  console.log(`✅ Seller Store created: ${sellerProfile.storeName}`);

  // 3. Categories
  const categories = [
    { name: 'Phones & Tablets', slug: 'phones-tablets', icon: '📱' },
    { name: 'Computers & Laptops', slug: 'computers-laptops', icon: '💻' },
    { name: 'Fashion & Wearables', slug: 'fashion-wearables', icon: '👕' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: '✨' },
    { name: 'Groceries & Essentials', slug: 'groceries-essentials', icon: '🛒' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        description: `Explore top deals on ${c.name}`,
      },
    });
    createdCategories[c.slug] = cat.id;
  }
  console.log('✅ Categories seeded');

  // 4. Default Commission Rule (5%)
  await prisma.commissionRule.create({
    data: {
      scope: 'global',
      rateBps: 500, // 5%
      active: true,
    },
  });
  console.log('✅ Global commission rule (5%) created');

  // 5. Seed Initial Products
  const productsData = [
    {
      title: 'UltraBook Pro 15 M3 16GB / 512GB SSD',
      slug: 'ultrabook-pro-15-m3',
      description: 'Supercharged performance for professionals. Retina display with TrueTone, 18-hour battery life, and space gray aluminum chassis.',
      categorySlug: 'computers-laptops',
      basePriceMinor: 145000000, // 1,450,000 NGN
      compareAtPriceMinor: 160000000,
      sku: 'APX-M3-RET-512',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      ],
      stockQuantity: 25,
    },
    {
      title: 'Nuvora Nova 5G Smartphone 256GB Gold',
      slug: 'nuvora-nova-5g-smartphone',
      description: '6.7-inch AMOLED 120Hz display, 108MP Pro-grade Triple Camera System, 5000mAh battery with 67W SuperFast Charge.',
      categorySlug: 'phones-tablets',
      basePriceMinor: 48000000, // 480,000 NGN
      compareAtPriceMinor: 52000000,
      sku: 'APX-NOVA-5G-GLD',
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      ],
      stockQuantity: 40,
    },
    {
      title: 'Noise Cancelling Wireless Headphones ANC',
      slug: 'noise-cancelling-wireless-headphones-anc',
      description: 'Hi-Res audio clarity, active noise cancellation, dual beamforming microphones, memory foam ear cushions.',
      categorySlug: 'phones-tablets',
      basePriceMinor: 12500000, // 125,000 NGN
      compareAtPriceMinor: 14000000,
      sku: 'APX-ANC-HD-BLK',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ],
      stockQuantity: 15,
    },
  ];

  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        sellerId: sellerProfile.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        categoryId: createdCategories[p.categorySlug],
        basePriceMinor: p.basePriceMinor,
        compareAtPriceMinor: p.compareAtPriceMinor,
        sku: p.sku,
        images: p.images,
        status: ProductStatus.PUBLISHED,
        variants: {
          create: [
            {
              title: 'Standard Edition',
              sku: `${p.sku}-STD`,
              priceMinor: p.basePriceMinor,
              compareAtPriceMinor: p.compareAtPriceMinor,
              stockQuantity: p.stockQuantity,
              isDefault: true,
            },
          ],
        },
      },
    });
    console.log(`✅ Seeded Product: ${prod.title}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
