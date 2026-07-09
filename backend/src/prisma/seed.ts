import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.admin.deleteMany();
  await prisma.report.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.community.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.application.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  const hashedDefaultPassword = await bcrypt.hash("Password123", 10);

  // 1. Create Users
  const userDhruv = await prisma.user.create({
    data: {
      name: "Dhruv C.",
      email: "dhruv@iitd.ac.in",
      passwordHash: hashedDefaultPassword,
      role: "STUDENT",
      isVerified: true,
    },
  });

  const userSneha = await prisma.user.create({
    data: {
      name: "Sneha R.",
      email: "sneha@iitb.ac.in",
      passwordHash: hashedDefaultPassword,
      role: "FOUNDER",
      isVerified: true,
    },
  });

  const userPriya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@bits.ac.in",
      passwordHash: hashedDefaultPassword,
      role: "STUDENT",
      isVerified: true,
    },
  });

  const userKaran = await prisma.user.create({
    data: {
      name: "Karan J.",
      email: "karan@nid.edu",
      passwordHash: hashedDefaultPassword,
      role: "STUDENT",
      isVerified: true,
    },
  });

  const userRahul = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@iiit.ac.in",
      passwordHash: hashedDefaultPassword,
      role: "FOUNDER",
      isVerified: true,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@hustlr.in",
      passwordHash: hashedDefaultPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("Users created.");

  // 2. Create Profiles
  const profileDhruv = await prisma.profile.create({
    data: {
      userId: userDhruv.id,
      username: "@dhruvc",
      headline: "Full Stack Developer & Technical Co-founder",
      university: "IIT Delhi",
      degree: "B.Tech Computer Science",
      gradYear: "2026",
      availability: "AVAILABLE_FOR_FREELANCE" as any,
      bio: "I'm a full-stack developer passionate about building scalable, user-centric distributed systems. Previously interning at Swiggy and founded an ed-tech micro-saas.",
      github: "github.com/dhruvc",
      twitter: "twitter.com/dhruvc",
      portfolioUrl: "dhruv.dev",
      reputation: 4.9,
      collabScore: 98.0,
      profileViews: 1240,
      badges: ["Top Freelancer", "Hackathon Winner", "Verified Developer"],
    },
  });

  const profileSneha = await prisma.profile.create({
    data: {
      userId: userSneha.id,
      username: "@snehar",
      headline: "AI Engineer & Founder of Nexus AI",
      university: "IIT Bombay",
      degree: "M.Tech Artificial Intelligence",
      gradYear: "2025",
      availability: "AVAILABLE_NOW" as any,
      bio: "Building ML models for startups. 3x Hackathon winner. Currently working on open-source LLM tooling and agentic workflows.",
      github: "github.com/snehar",
      twitter: "twitter.com/snehar",
      portfolioUrl: "sneha.ai",
      reputation: 4.9,
      collabScore: 99.0,
      profileViews: 850,
      badges: ["Top Rated", "AI Expert", "Nexus Lead"],
    },
  });

  const profilePriya = await prisma.profile.create({
    data: {
      userId: userPriya.id,
      username: "@priyapatel",
      headline: "Frontend Engineer & UI Developer",
      university: "BITS Pilani",
      degree: "B.E. Computer Science",
      gradYear: "2026",
      availability: "BUSY" as any,
      bio: "Love building pixel-perfect web apps with React.js and Framer Motion. Currently interning at Razorpay, open to collaborations.",
      github: "github.com/priyapatel",
      twitter: "twitter.com/priyapatel",
      portfolioUrl: "priya.dev",
      reputation: 4.9,
      collabScore: 96.0,
      profileViews: 610,
      badges: ["Rising Talent", "React Enthusiast"],
    },
  });

  const profileKaran = await prisma.profile.create({
    data: {
      userId: userKaran.id,
      username: "@karanj",
      headline: "Lead UI/UX Designer",
      university: "NID Ahmedabad",
      degree: "M.Des Interaction Design",
      gradYear: "2025",
      availability: "OPEN_TO_PROJECTS" as any,
      bio: "Obsessed with micro-interactions and clean typography. Designing the next generation of fintech SaaS products.",
      github: "behance.net/karanj",
      twitter: "twitter.com/karanj",
      portfolioUrl: "karan.design",
      reputation: 4.8,
      collabScore: 92.0,
      profileViews: 740,
      badges: ["Campus Expert", "Figma Wizard"],
    },
  });

  const profileRahul = await prisma.profile.create({
    data: {
      userId: userRahul.id,
      username: "@rahulv",
      headline: "Founder of Campus Ride Share App",
      university: "IIIT Hyderabad",
      degree: "B.Tech CSE",
      gradYear: "2024",
      availability: "BUSY" as any,
      bio: "Scaling backends for high-growth student startups. Building robustness in serverless edge functions.",
      github: "github.com/rahulv",
      reputation: 4.8,
      collabScore: 94.0,
      profileViews: 480,
      badges: ["Founder", "Go Developer"],
    },
  });

  console.log("Profiles created.");

  // 3. Create Skills
  await prisma.skill.createMany({
    data: [
      { profileId: profileDhruv.id, name: "React.js", level: "ADVANCED", endorsements: 42 },
      { profileId: profileDhruv.id, name: "Node.js", level: "ADVANCED", endorsements: 38 },
      { profileId: profileDhruv.id, name: "TypeScript", level: "ADVANCED", endorsements: 45 },
      { profileId: profileDhruv.id, name: "Go", level: "INTERMEDIATE", endorsements: 18 },
      
      { profileId: profileSneha.id, name: "Python", level: "ADVANCED", endorsements: 62 },
      { profileId: profileSneha.id, name: "TensorFlow", level: "ADVANCED", endorsements: 51 },
      { profileId: profileSneha.id, name: "PyTorch", level: "ADVANCED", endorsements: 44 },
      { profileId: profileSneha.id, name: "OpenAI API", level: "ADVANCED", endorsements: 38 },

      { profileId: profilePriya.id, name: "React", level: "ADVANCED", endorsements: 31 },
      { profileId: profilePriya.id, name: "CSS/Tailwind", level: "ADVANCED", endorsements: 29 },
      { profileId: profilePriya.id, name: "Framer Motion", level: "ADVANCED", endorsements: 15 },
      
      { profileId: profileKaran.id, name: "Figma", level: "ADVANCED", endorsements: 55 },
      { profileId: profileKaran.id, name: "Design Systems", level: "ADVANCED", endorsements: 41 },
      { profileId: profileKaran.id, name: "Framer", level: "INTERMEDIATE", endorsements: 12 },
    ],
  });

  // 4. Create Portfolios
  await prisma.portfolio.createMany({
    data: [
      {
        profileId: profileDhruv.id,
        title: "Campus Delivery MVP",
        type: "Startup Build",
        description: "Built the entire technical foundation for a student-to-student marketplace. Scaled to 2,000+ weekly active users.",
        tech: ["React Native", "Firebase", "Node.js"],
        metrics: "₹10L GMV / mo",
        link: "https://github.com/dhruvc/delivery",
      },
      {
        profileId: profileDhruv.id,
        title: "Fintech Dashboard",
        type: "Freelance",
        description: "Designed and engineered a high-performance analytics dashboard for a Series A fintech startup.",
        tech: ["React", "D3.js", "Tailwind CSS"],
        metrics: "99/100 Lighthouse",
        link: "https://dashboard.dev",
      },
      {
        profileId: profileSneha.id,
        title: "Open Source LLM Tooling",
        type: "Open Source",
        description: "Built semantic indexing frameworks and multi-agent systems for developers orchestrating generative models.",
        tech: ["Python", "LangChain", "VectorDB"],
        metrics: "12k GitHub Stars",
        link: "https://github.com/nexus/agent-core",
      },
    ],
  });

  // 5. Create Experiences
  await prisma.experience.createMany({
    data: [
      {
        profileId: profileDhruv.id,
        role: "Software Engineering Intern",
        company: "Swiggy",
        date: "Summer 2025",
        description: "Optimized onboarding flow pipelines for global merchants, reducing churn rate by 14%.",
      },
      {
        profileId: profileDhruv.id,
        role: "Freelance Lead",
        company: "Self-Employed",
        date: "Jan 2024 - Present",
        description: "Successfully shipped 14+ high-value full stack projects for early stage startups.",
      },
    ],
  });

  console.log("Skills, portfolios, and experiences created.");

  // 6. Create Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      creatorId: userRahul.id,
      title: "Lead React Native Developer for Delivery MVP",
      description: "Looking for an experienced student developer to build the core mobile app for our funded campus delivery startup. Must be comfortable with Expo, Firebase, and state management.",
      budget: "₹40,000 - ₹80,000",
      tags: ["React Native", "Firebase", "TypeScript", "Redux"],
      clientName: "Rahul Verma",
      clientReputation: 4.8,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      projectType: "STARTUP_PROJECT",
      duration: "1-3 months",
      teamSizeNeeded: 2,
      workMode: "HYBRID",
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      creatorId: userSneha.id,
      title: "UI/UX Design for FinTech Dashboard",
      description: "Need a clean, modern dashboard design including dark mode for a student-led fintech project. Focus on beautiful data visualization and micro-interactions.",
      budget: "₹15,000 - ₹30,000",
      tags: ["Figma", "UI/UX", "Prototyping"],
      clientName: "Sneha R.",
      clientReputation: 4.9,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      projectType: "FREELANCE_GIG",
      duration: "1-4 weeks",
      teamSizeNeeded: 1,
      workMode: "REMOTE",
    },
  });

  console.log("Opportunities created.");

  // 7. Create Applications
  await prisma.application.createMany({
    data: [
      {
        opportunityId: opp1.id,
        applicantId: userDhruv.id,
        status: "INTERVIEWING",
        proposal: "I have built a campus ride share app and am highly comfortable with Expo. I can deliver this MVP within 3 weeks.",
        githubLink: "github.com/dhruvc",
        resumeUrl: "https://cloudinary.com/resume.pdf",
      },
      {
        opportunityId: opp2.id,
        applicantId: userKaran.id,
        status: "SHORTLISTED",
        proposal: "Fintech interaction design is my passion. You can check my dashboard designs on my portfolio. I will supply a full Figma Design system.",
        githubLink: "github.com/karanj",
        resumeUrl: "https://cloudinary.com/resume.pdf",
      },
    ],
  });

  // 8. Create Teams
  const teamNexus = await prisma.team.create({
    data: {
      name: "Nexus AI Team",
      description: "Building generative agent frameworks for university educational assistance.",
      leadId: userSneha.id,
      status: "IN_PROGRESS",
    },
  });

  const teamDelivery = await prisma.team.create({
    data: {
      name: "Campus Ride Share",
      description: "Ride sharing startup for IIT Delhi campus students.",
      leadId: userRahul.id,
      status: "RECRUITING",
    },
  });

  // Add members
  await prisma.teamMember.createMany({
    data: [
      { teamId: teamNexus.id, userId: userSneha.id, role: "Lead" },
      { teamId: teamNexus.id, userId: userDhruv.id, role: "Backend Engineer" },
      { teamId: teamNexus.id, userId: userPriya.id, role: "Frontend Dev" },
      { teamId: teamNexus.id, userId: userKaran.id, role: "Designer" },
      
      { teamId: teamDelivery.id, userId: userRahul.id, role: "Lead" },
      { teamId: teamDelivery.id, userId: userDhruv.id, role: "Invited" }, // Invited but not accepted yet
    ],
  });

  console.log("Teams and team members created.");

  // 9. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        teamId: teamNexus.id,
        title: "Finish Supabase Auth PR",
        description: "Set up login and signup routes in Next.js and secure the dashboard middleware.",
        status: "TODO",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        assigneeId: userPriya.id,
      },
      {
        teamId: teamNexus.id,
        title: "Optimize Vector Index Queries",
        description: "Index chunking parameters for faster search query retrieval.",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        assigneeId: userDhruv.id,
      },
      {
        teamId: teamNexus.id,
        title: "Design Landing Page Mockups",
        description: "Figma wireframes for the user portal launch.",
        status: "DONE",
        assigneeId: userKaran.id,
      },
    ],
  });

  // 10. Create Chats & Messages
  const chatGroup = await prisma.chat.create({
    data: {
      type: "TEAM",
      name: "Nexus AI Team",
      avatarGradient: "from-blue-600 to-indigo-600",
      avatarText: "N",
    },
  });

  const chatDirect = await prisma.chat.create({
    data: {
      type: "DIRECT",
    },
  });

  // Add participants
  await prisma.chatParticipant.createMany({
    data: [
      { chatId: chatGroup.id, userId: userSneha.id },
      { chatId: chatGroup.id, userId: userDhruv.id },
      { chatId: chatGroup.id, userId: userPriya.id },
      { chatId: chatGroup.id, userId: userKaran.id },

      { chatId: chatDirect.id, userId: userDhruv.id },
      { chatId: chatDirect.id, userId: userSneha.id },
    ],
  });

  // Add group messages
  await prisma.message.createMany({
    data: [
      {
        chatId: chatGroup.id,
        senderId: userPriya.id,
        text: "Hey team! I've just finished the initial setup for the authentication flow. Could someone review the PR?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        chatId: chatGroup.id,
        senderId: userKaran.id,
        text: "Awesome work! I'll take a look at it right after my current class sync.",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        chatId: chatGroup.id,
        senderId: userDhruv.id,
        text: "I can test it locally as well. Did you update the README documentation?",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        chatId: chatGroup.id,
        senderId: userPriya.id,
        text: "Yes, I pushed the new Auth components and environment secrets details to main.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  });

  // Add direct messages
  await prisma.message.createMany({
    data: [
      {
        chatId: chatDirect.id,
        senderId: userSneha.id,
        text: "Hi Dhruv, are you free to look over the ML embedding generation file tonight?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        chatId: chatDirect.id,
        senderId: userDhruv.id,
        text: "Yes Sneha, send it over. I have optimized the database models too.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        chatId: chatDirect.id,
        senderId: userSneha.id,
        text: "Sounds great! Let's schedule a call tomorrow.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  });

  console.log("Chats and messages created.");

  // 11. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        authorId: userRahul.id,
        targetUserId: userDhruv.id,
        text: "Dhruv is exceptional. He not only wrote clean, scalable code but also helped refine our delivery logistics logic. Absolute 10/10.",
        rating: 5,
      },
      {
        authorId: userKaran.id,
        targetUserId: userDhruv.id,
        text: "One of the best engineers I've collaborated with. Pixel-perfect implementations of Figma specs and great async updates.",
        rating: 5,
      },
    ],
  });

  // 12. Create Communities
  const commDev = await prisma.community.create({
    data: { name: "Developers", category: "Technology", description: "Node, React, Rust, Go discussions" },
  });
  const commDesign = await prisma.community.create({
    data: { name: "Designers", category: "Design", description: "UI/UX, prototyping and feedback" },
  });
  const commAI = await prisma.community.create({
    data: { name: "AI/ML Enthusiasts", category: "AI", description: "Generative models and engineering chats" },
  });

  // 13. Create Community Posts & Comments
  const post1 = await prisma.post.create({
    data: {
      communityId: commDev.id,
      userId: userDhruv.id,
      title: "Why you should stop using simple useEffect for data fetching",
      content: "Using useEffect directly in React for fetching backend data creates numerous race conditions and loading lags. Instead, prefer libraries like React Query, SWR, or custom routing loaders. What are your thoughts?",
      likesCount: 2,
    },
  });

  await prisma.postLike.createMany({
    data: [
      { postId: post1.id, userId: userSneha.id },
      { postId: post1.id, userId: userPriya.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { postId: post1.id, userId: userPriya.id, text: "Totally agree! Switched our teams led by Sneha to React Query and it simplified state management significantly." },
      { postId: post1.id, userId: userSneha.id, text: "Also, handling stale time caching saves countless database query costs." },
    ],
  });

  // 14. Create Notifications
  await prisma.notification.createMany({
    data: [
      { userId: userDhruv.id, type: "TEAM_INVITE", title: "New Team Invite", message: "Rahul Verma invited you to join Campus Ride Share team." },
      { userId: userDhruv.id, type: "APPLICATION_STATUS", title: "Application shortlisting", message: "Your application for Lead React Native Developer has been shortlisted." },
      { userId: userDhruv.id, type: "NEW_MESSAGE", title: "New chat from Sneha", message: "Sneha R.: Sounds great! Let's schedule a call tomorrow." },
    ],
  });

  // 15. Create Admin Details
  await prisma.admin.create({
    data: {
      userId: userAdmin.id,
      level: "SUPERADMIN",
      privileges: ["MANAGE_USERS", "RESOLVE_REPORTS", "VERIFY_CAMPUSES"],
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
