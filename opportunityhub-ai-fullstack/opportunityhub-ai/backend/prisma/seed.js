import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const jobs = [
  {
    type: "JOB", title: "Junior Frontend Developer", organization: "Northstar Labs",
    description: "Build accessible web interfaces with React, collaborate with product teams, and improve user experiences. This is illustrative sample content.",
    country: "Remote", locationType: "REMOTE", employmentType: "FULL_TIME",
    salaryMin: 35000, salaryMax: 52000, currency: "USD",
    applicationUrl: "https://example.com/jobs/frontend", sourceUrl: "https://example.com/jobs/frontend",
    sourceName: "Demo source", publishedAt: new Date(), deadline: new Date(Date.now() + 21*86400000),
    verificationStatus: "UNVERIFIED", tags: ["React", "JavaScript", "CSS", "Entry level"], isDemo: true
  },
  {
    type: "JOB", title: "Data Analyst Intern", organization: "BrightPath Analytics",
    description: "Support reporting, data cleaning, dashboard development and research. This is illustrative sample content.",
    country: "United Kingdom", locationType: "HYBRID", employmentType: "INTERNSHIP",
    salaryMin: 18000, salaryMax: 24000, currency: "GBP",
    applicationUrl: "https://example.com/jobs/data-intern", sourceUrl: "https://example.com/jobs/data-intern",
    sourceName: "Demo source", publishedAt: new Date(Date.now()-86400000), deadline: new Date(Date.now()+30*86400000),
    verificationStatus: "UNVERIFIED", tags: ["SQL", "Excel", "Python", "Internship"], isDemo: true
  }
];

const scholarships = [
  {
    type: "SCHOLARSHIP", title: "Global Master's Study Award", organization: "International Learning Institute",
    description: "Illustrative scholarship record for testing the application. Check official eligibility and funding terms before applying.",
    country: "Germany", degreeLevel: "MASTER", field: "Multiple disciplines", fundingType: "FULLY_FUNDED",
    applicationUrl: "https://example.com/scholarships/global-masters", sourceUrl: "https://example.com/scholarships/global-masters",
    sourceName: "Demo source", publishedAt: new Date(), deadline: new Date(Date.now()+45*86400000),
    verificationStatus: "UNVERIFIED", tags: ["Master's", "International", "Funding"], isDemo: true
  },
  {
    type: "SCHOLARSHIP", title: "Future Researchers Fellowship", organization: "Research Futures Foundation",
    description: "Illustrative fellowship record for UI testing. Requirements and funding are not real.",
    country: "Worldwide", degreeLevel: "PHD", field: "Science and technology", fundingType: "PARTIALLY_FUNDED",
    applicationUrl: "https://example.com/scholarships/research", sourceUrl: "https://example.com/scholarships/research",
    sourceName: "Demo source", publishedAt: new Date(Date.now()-2*86400000), deadline: new Date(Date.now()+60*86400000),
    verificationStatus: "UNVERIFIED", tags: ["PhD", "Research", "STEM"], isDemo: true
  }
];

async function main() {
  const email = "demo@opportunityhub.ai";
  const passwordHash = await bcrypt.hash("Opportunity123!", 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User", email, passwordHash,
      profile: { create: { country: "Worldwide", headline: "Exploring new opportunities", skills: ["Research", "Communication"] } }
    }
  });

  for (const item of [...jobs, ...scholarships]) {
    const exists = await prisma.opportunity.findFirst({ where: { title: item.title, organization: item.organization } });
    if (!exists) await prisma.opportunity.create({ data: item });
  }

  await prisma.notification.createMany({
    data: [
      { userId: user.id, title: "Welcome to OpportunityHub AI", message: "Your demo workspace is ready. Complete your profile to improve recommendations.", kind: "WELCOME" }
    ],
    skipDuplicates: true
  });
  console.log("Seed complete. Demo login: demo@opportunityhub.ai / Opportunity123!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
