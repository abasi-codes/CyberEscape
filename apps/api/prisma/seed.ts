import { PrismaClient, BadgeTier, BadgeCategory, RoomType, PuzzleType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rooms = [
    { name: "Password & Authentication", slug: "password-auth", description: "Learn to create and manage strong passwords, understand MFA, and recognize authentication vulnerabilities.", type: RoomType.PASSWORD_AUTH, order: 1, timeLimit: 1800, difficulty: 1, imageUrl: "/rooms/password-auth.webp" },
    { name: "Phishing Defense", slug: "phishing-defense", description: "Identify phishing emails, malicious links, and social engineering tactics.", type: RoomType.PHISHING, order: 2, timeLimit: 1800, difficulty: 2, imageUrl: "/rooms/phishing.webp" },
    { name: "Data Protection", slug: "data-protection", description: "Master data classification, encryption basics, and safe data handling.", type: RoomType.DATA_PROTECTION, order: 3, timeLimit: 2100, difficulty: 2, imageUrl: "/rooms/data-protection.webp" },
    { name: "Network Security", slug: "network-security", description: "Understand firewalls, VPNs, Wi-Fi security, and network threats.", type: RoomType.NETWORK_SECURITY, order: 4, timeLimit: 2100, difficulty: 3, imageUrl: "/rooms/network-security.webp" },
    { name: "Insider Threat", slug: "insider-threat", description: "Recognize insider threat indicators and access control procedures.", type: RoomType.INSIDER_THREAT, order: 5, timeLimit: 1800, difficulty: 3, imageUrl: "/rooms/insider-threat.webp" },
    { name: "Incident Response", slug: "incident-response", description: "Practice incident detection, reporting, containment, and recovery.", type: RoomType.INCIDENT_RESPONSE, order: 6, timeLimit: 2400, difficulty: 4, imageUrl: "/rooms/incident-response.webp" },
  ];

  const createdRooms: Record<string, string> = {};
  for (const room of rooms) {
    const r = await prisma.room.upsert({ where: { slug: room.slug }, update: room, create: room });
    createdRooms[room.slug] = r.id;
  }

  const room1Puzzles = [
    { roomId: createdRooms["password-auth"], title: "Password Strength Analyzer", description: "Evaluate password strength and identify what makes a password strong.", type: PuzzleType.PASSWORD_STRENGTH, order: 1, basePoints: 100, timeLimit: 180, config: JSON.stringify({ minLength: 12, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSpecial: true }), hints: JSON.stringify(["Think about length vs complexity", "Consider using a passphrase", "Check for common patterns"]), answer: JSON.stringify({ minScore: 80 }), explanation: "Strong passwords are 12+ chars with uppercase, lowercase, numbers, and special characters." },
    { roomId: createdRooms["password-auth"], title: "MFA Challenge", description: "Configure multi-factor authentication correctly.", type: PuzzleType.MULTIPLE_CHOICE, order: 2, basePoints: 150, timeLimit: 120, config: JSON.stringify({ question: "Which MFA method is most resistant to phishing?", options: ["SMS codes", "Email codes", "Hardware security key (FIDO2)", "Authenticator app"] }), hints: JSON.stringify(["Think about interception", "Consider physical vs digital"]), answer: JSON.stringify({ correct: 2 }), explanation: "FIDO2 hardware keys verify domain cryptographically, preventing phishing." },
    { roomId: createdRooms["password-auth"], title: "Credential Storage", description: "Match credential storage methods to security ratings.", type: PuzzleType.DRAG_DROP, order: 3, basePoints: 120, timeLimit: 150, config: JSON.stringify({ items: ["Plain text file", "Browser saved", "Password manager", "Sticky note", "Encrypted vault"], targets: ["Very Unsafe", "Unsafe", "Safe", "Very Unsafe", "Very Safe"] }), hints: JSON.stringify(["Consider access methods", "Think about encryption"]), answer: JSON.stringify({ mapping: [0, 1, 2, 0, 4] }), explanation: "Password managers and encrypted vaults are safest." },
    { roomId: createdRooms["password-auth"], title: "Authentication Flow", description: "Order the secure authentication steps.", type: PuzzleType.SEQUENCE, order: 4, basePoints: 130, timeLimit: 180, config: JSON.stringify({ items: ["Enter username", "Enter password", "Receive MFA prompt", "Verify MFA", "Session token issued", "Access granted"] }), hints: JSON.stringify(["Auth before authorization", "MFA after primary creds"]), answer: JSON.stringify({ order: [0, 1, 2, 3, 4, 5] }), explanation: "Secure auth: identify, password, second factor, session, access." },
  ];

  const room3Puzzles = [
    { roomId: createdRooms["data-protection"], title: "Data Classification", description: "Classify data into sensitivity categories.", type: PuzzleType.DRAG_DROP, order: 1, basePoints: 100, timeLimit: 180, config: JSON.stringify({ items: ["Employee SSN", "Public blog post", "Internal memo", "Customer credit card", "Office location", "Trade secrets"], targets: ["Restricted", "Public", "Internal", "Restricted", "Public", "Confidential"] }), hints: JSON.stringify(["PII is restricted", "Consider regulations"]), answer: JSON.stringify({ mapping: [0, 1, 2, 0, 1, 3] }), explanation: "Classification protects info based on sensitivity level." },
    { roomId: createdRooms["data-protection"], title: "Encryption Basics", description: "Match encryption concepts to descriptions.", type: PuzzleType.MATCHING, order: 2, basePoints: 120, timeLimit: 150, config: JSON.stringify({ left: ["AES-256", "RSA", "TLS", "Hashing"], right: ["Symmetric encryption", "Asymmetric encryption", "Transport security", "One-way integrity"] }), hints: JSON.stringify(["Symmetric = same key", "TLS = HTTPS"]), answer: JSON.stringify({ pairs: [[0,0],[1,1],[2,2],[3,3]] }), explanation: "Different encryption types suit different scenarios." },
    { roomId: createdRooms["data-protection"], title: "Data Breach Response", description: "Order the correct breach response steps.", type: PuzzleType.SEQUENCE, order: 3, basePoints: 150, timeLimit: 200, config: JSON.stringify({ items: ["Contain breach", "Assess scope", "Notify security", "Document findings", "Notify affected parties", "Implement fixes"] }), hints: JSON.stringify(["Stop damage first", "Documentation is key"]), answer: JSON.stringify({ order: [2, 0, 1, 3, 4, 5] }), explanation: "Notify, contain, assess, document, notify parties, remediate." },
  ];

  for (const p of [...room1Puzzles, ...room3Puzzles]) { await prisma.puzzle.create({ data: p }); }

  const badges = [
    { name: "First Steps", description: "Complete your first puzzle", icon: "rocket", tier: BadgeTier.BRONZE, category: BadgeCategory.COMPLETION, criteria: JSON.stringify({ puzzlesSolved: 1 }), points: 10 },
    { name: "Room Rookie", description: "Complete your first room", icon: "door-open", tier: BadgeTier.BRONZE, category: BadgeCategory.COMPLETION, criteria: JSON.stringify({ roomsCompleted: 1 }), points: 25 },
    { name: "Escape Artist", description: "Complete all 6 rooms", icon: "key", tier: BadgeTier.GOLD, category: BadgeCategory.COMPLETION, criteria: JSON.stringify({ roomsCompleted: 6 }), points: 200 },
    { name: "Speed Demon", description: "Complete a room in under 10 minutes", icon: "zap", tier: BadgeTier.SILVER, category: BadgeCategory.SPEED, criteria: JSON.stringify({ roomCompletedUnder: 600 }), points: 50 },
    { name: "Lightning Fast", description: "Complete a puzzle in under 30 seconds", icon: "bolt", tier: BadgeTier.GOLD, category: BadgeCategory.SPEED, criteria: JSON.stringify({ puzzleCompletedUnder: 30 }), points: 75 },
    { name: "Sharpshooter", description: "5 puzzles without wrong answers", icon: "crosshair", tier: BadgeTier.SILVER, category: BadgeCategory.ACCURACY, criteria: JSON.stringify({ perfectPuzzlesInRow: 5 }), points: 50 },
    { name: "Perfectionist", description: "100% accuracy in a room", icon: "star", tier: BadgeTier.GOLD, category: BadgeCategory.ACCURACY, criteria: JSON.stringify({ roomPerfectAccuracy: true }), points: 100 },
    { name: "On Fire", description: "3-day login streak", icon: "flame", tier: BadgeTier.BRONZE, category: BadgeCategory.STREAK, criteria: JSON.stringify({ loginStreak: 3 }), points: 15 },
    { name: "Dedicated", description: "7-day login streak", icon: "calendar", tier: BadgeTier.SILVER, category: BadgeCategory.STREAK, criteria: JSON.stringify({ loginStreak: 7 }), points: 40 },
    { name: "Unstoppable", description: "30-day login streak", icon: "trophy", tier: BadgeTier.PLATINUM, category: BadgeCategory.STREAK, criteria: JSON.stringify({ loginStreak: 30 }), points: 150 },
    { name: "Team Player", description: "Complete a room in team mode", icon: "users", tier: BadgeTier.BRONZE, category: BadgeCategory.SOCIAL, criteria: JSON.stringify({ teamRoomsCompleted: 1 }), points: 20 },
    { name: "Leader", description: "Lead a team to complete all rooms", icon: "crown", tier: BadgeTier.PLATINUM, category: BadgeCategory.SOCIAL, criteria: JSON.stringify({ teamLeaderAllRooms: true }), points: 200 },
    { name: "Password Pro", description: "Master Password & Authentication", icon: "lock", tier: BadgeTier.GOLD, category: BadgeCategory.MASTERY, criteria: JSON.stringify({ roomMastered: "password-auth" }), points: 100 },
    { name: "Phishing Expert", description: "Master Phishing Defense", icon: "shield", tier: BadgeTier.GOLD, category: BadgeCategory.MASTERY, criteria: JSON.stringify({ roomMastered: "phishing-defense" }), points: 100 },
    { name: "Cyber Guardian", description: "Achieve Diamond tier total score", icon: "gem", tier: BadgeTier.DIAMOND, category: BadgeCategory.SPECIAL, criteria: JSON.stringify({ totalScore: 5000 }), points: 500 },
  ];

  for (const b of badges) { await prisma.badge.upsert({ where: { name: b.name }, update: b, create: b }); }

  console.log("Seed completed successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
