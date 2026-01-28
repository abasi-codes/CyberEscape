import { PrismaClient, BadgeTier, BadgeCategory, RoomType, PuzzleType, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // Seed default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Default", slug: "default" },
  });

  // Seed test user
  const passwordHash = await bcrypt.hash("Test1234!", 10);
  await prisma.user.upsert({
    where: { email: "tester@test.com" },
    update: { passwordHash },
    create: {
      email: "tester@test.com",
      firstName: "Test",
      lastName: "User",
      passwordHash,
      status: UserStatus.ACTIVE,
      organizationId: defaultOrg.id,
      stats: { create: {} },
    },
  });
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
    {
      roomId: createdRooms["password-auth"],
      title: "Password Strength Analyzer",
      description: "Evaluate password strength and identify what makes a password strong.",
      type: PuzzleType.PASSWORD_STRENGTH,
      order: 1,
      basePoints: 100,
      timeLimit: 180,
      config: JSON.stringify({
        minLength: 12,
        requireUpper: true,
        requireLower: true,
        requireNumber: true,
        requireSpecial: true,
      }),
      hints: JSON.stringify(["Think about length vs complexity", "Consider using a passphrase", "Check for common patterns"]),
      answer: JSON.stringify({ minScore: 80 }),
      explanation: "Strong passwords are 12+ chars with uppercase, lowercase, numbers, and special characters.",
    },
    {
      roomId: createdRooms["password-auth"],
      title: "MFA Challenge",
      description: "Configure multi-factor authentication correctly.",
      type: PuzzleType.MULTIPLE_CHOICE,
      order: 2,
      basePoints: 150,
      timeLimit: 120,
      config: JSON.stringify({
        question: "Which MFA method is most resistant to phishing?",
        options: [
          { id: "0", text: "SMS codes" },
          { id: "1", text: "Email codes" },
          { id: "2", text: "Hardware security key (FIDO2)" },
          { id: "3", text: "Authenticator app" },
        ],
      }),
      hints: JSON.stringify(["Think about interception", "Consider physical vs digital"]),
      answer: JSON.stringify({ correct: 2 }),
      explanation: "FIDO2 hardware keys verify domain cryptographically, preventing phishing.",
    },
    {
      roomId: createdRooms["password-auth"],
      title: "Credential Storage",
      description: "Match credential storage methods to security ratings.",
      type: PuzzleType.DRAG_DROP,
      order: 3,
      basePoints: 120,
      timeLimit: 150,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Plain text file" },
          { id: "1", label: "Browser saved" },
          { id: "2", label: "Password manager" },
          { id: "3", label: "Sticky note" },
          { id: "4", label: "Encrypted vault" },
        ],
        categories: [
          { id: "very-unsafe", label: "Very Unsafe" },
          { id: "unsafe", label: "Unsafe" },
          { id: "safe", label: "Safe" },
          { id: "very-safe", label: "Very Safe" },
        ],
      }),
      hints: JSON.stringify(["Consider access methods", "Think about encryption"]),
      answer: JSON.stringify({ mapping: [0, 1, 2, 0, 4] }),
      explanation: "Password managers and encrypted vaults are safest.",
    },
    {
      roomId: createdRooms["password-auth"],
      title: "Authentication Flow",
      description: "Order the secure authentication steps.",
      type: PuzzleType.SEQUENCE,
      order: 4,
      basePoints: 130,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Enter username" },
          { id: "1", label: "Enter password" },
          { id: "2", label: "Receive MFA prompt" },
          { id: "3", label: "Verify MFA" },
          { id: "4", label: "Session token issued" },
          { id: "5", label: "Access granted" },
        ],
        categories: [
          { id: "step-1", label: "Step 1" },
          { id: "step-2", label: "Step 2" },
          { id: "step-3", label: "Step 3" },
          { id: "step-4", label: "Step 4" },
          { id: "step-5", label: "Step 5" },
          { id: "step-6", label: "Step 6" },
        ],
      }),
      hints: JSON.stringify(["Auth before authorization", "MFA after primary creds"]),
      answer: JSON.stringify({ order: [0, 1, 2, 3, 4, 5] }),
      explanation: "Secure auth: identify, password, second factor, session, access.",
    },
  ];

  const room3Puzzles = [
    {
      roomId: createdRooms["data-protection"],
      title: "Data Classification",
      description: "Classify data into sensitivity categories.",
      type: PuzzleType.DRAG_DROP,
      order: 1,
      basePoints: 100,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Employee SSN" },
          { id: "1", label: "Public blog post" },
          { id: "2", label: "Internal memo" },
          { id: "3", label: "Customer credit card" },
          { id: "4", label: "Office location" },
          { id: "5", label: "Trade secrets" },
        ],
        categories: [
          { id: "public", label: "Public" },
          { id: "internal", label: "Internal" },
          { id: "confidential", label: "Confidential" },
          { id: "restricted", label: "Restricted" },
        ],
      }),
      hints: JSON.stringify(["PII is restricted", "Consider regulations"]),
      answer: JSON.stringify({ mapping: [0, 1, 2, 0, 1, 3] }),
      explanation: "Classification protects info based on sensitivity level.",
    },
    {
      roomId: createdRooms["data-protection"],
      title: "Encryption Basics",
      description: "Match encryption concepts to descriptions.",
      type: PuzzleType.MATCHING,
      order: 2,
      basePoints: 120,
      timeLimit: 150,
      config: JSON.stringify({
        leftItems: [
          { id: "0", label: "AES-256" },
          { id: "1", label: "RSA" },
          { id: "2", label: "TLS" },
          { id: "3", label: "Hashing" },
        ],
        rightItems: [
          { id: "0", label: "Symmetric encryption" },
          { id: "1", label: "Asymmetric encryption" },
          { id: "2", label: "Transport security" },
          { id: "3", label: "One-way integrity" },
        ],
      }),
      hints: JSON.stringify(["Symmetric = same key", "TLS = HTTPS"]),
      answer: JSON.stringify({ pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] }),
      explanation: "Different encryption types suit different scenarios.",
    },
    {
      roomId: createdRooms["data-protection"],
      title: "Data Breach Response",
      description: "Order the correct breach response steps.",
      type: PuzzleType.SEQUENCE,
      order: 3,
      basePoints: 150,
      timeLimit: 200,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Contain breach" },
          { id: "1", label: "Assess scope" },
          { id: "2", label: "Notify security" },
          { id: "3", label: "Document findings" },
          { id: "4", label: "Notify affected parties" },
          { id: "5", label: "Implement fixes" },
        ],
        categories: [
          { id: "step-1", label: "Step 1" },
          { id: "step-2", label: "Step 2" },
          { id: "step-3", label: "Step 3" },
          { id: "step-4", label: "Step 4" },
          { id: "step-5", label: "Step 5" },
          { id: "step-6", label: "Step 6" },
        ],
      }),
      hints: JSON.stringify(["Stop damage first", "Documentation is key"]),
      answer: JSON.stringify({ order: [2, 0, 1, 3, 4, 5] }),
      explanation: "Notify, contain, assess, document, notify parties, remediate.",
    },
  ];

  const room2Puzzles = [
    {
      roomId: createdRooms["phishing-defense"],
      title: "Inbox Threat Detection",
      description: "Review emails and classify each as phishing or legitimate.",
      type: PuzzleType.PHISHING_CLASSIFICATION,
      order: 1,
      basePoints: 150,
      timeLimit: 300,
      config: JSON.stringify({
        emails: [
          { id: "1", from: "security@yourcompany.com", subject: "Mandatory Password Reset", body: "Hi,\n\nAs part of our scheduled security update, please reset your password using the company portal at https://portal.yourcompany.com/reset.\n\nThanks,\nIT Security Team", isPhishing: false, indicators: [] },
          { id: "2", from: "support@micros0ft.com", subject: "Unusual Sign-In Activity", body: "We detected unusual activity on your account. Click here immediately to verify your identity: http://micros0ft-verify.ru/login\n\nIf you don't act within 24 hours your account will be suspended.", isPhishing: true, indicators: ["Misspelled domain (micros0ft)", "Urgency pressure", "Suspicious URL (.ru domain)"] },
          { id: "3", from: "hr@yourcompany.com", subject: "Updated Benefits Package", body: "Hello,\n\nPlease review the updated benefits package for 2026 attached to this email. Contact HR if you have questions.\n\nBest,\nHuman Resources", isPhishing: false, indicators: [] },
          { id: "4", from: "ceo@yourcompany.net", subject: "Urgent Wire Transfer Needed", body: "I need you to process a wire transfer of $15,000 to the attached account immediately. This is confidential — do not discuss with anyone else.\n\nSent from my iPhone", isPhishing: true, indicators: ["Wrong domain (.net vs .com)", "Unusual request from CEO", "Secrecy demand", "Urgency pressure"] },
        ],
      }),
      hints: JSON.stringify(["Check the sender's domain carefully", "Watch for urgency and threats", "Verify unusual requests through a separate channel"]),
      answer: JSON.stringify({ correct: "phishing" }),
      explanation: "Phishing emails often use misspelled domains, urgency, and unusual requests to trick victims.",
    },
    {
      roomId: createdRooms["phishing-defense"],
      title: "Phishing Red Flags",
      description: "Identify which characteristics are common phishing indicators.",
      type: PuzzleType.MULTIPLE_CHOICE,
      order: 2,
      basePoints: 100,
      timeLimit: 120,
      config: JSON.stringify({
        question: "Which of the following is the STRONGEST indicator of a phishing email?",
        options: [
          { id: "0", text: "The email has a company logo" },
          { id: "1", text: "The sender domain is misspelled" },
          { id: "2", text: "The email was sent during business hours" },
          { id: "3", text: "The email includes a greeting" },
        ],
      }),
      hints: JSON.stringify(["Logos can be copied easily", "Focus on what is hard to fake"]),
      answer: JSON.stringify({ correct: 1 }),
      explanation: "A misspelled sender domain is a strong phishing indicator because attackers cannot send from the real domain.",
    },
    {
      roomId: createdRooms["phishing-defense"],
      title: "Social Engineering Tactics",
      description: "Match social engineering techniques to their descriptions.",
      type: PuzzleType.MATCHING,
      order: 3,
      basePoints: 120,
      timeLimit: 180,
      config: JSON.stringify({
        leftItems: [
          { id: "0", label: "Pretexting" },
          { id: "1", label: "Baiting" },
          { id: "2", label: "Tailgating" },
          { id: "3", label: "Quid pro quo" },
        ],
        rightItems: [
          { id: "0", label: "Creating a fabricated scenario" },
          { id: "1", label: "Offering something enticing" },
          { id: "2", label: "Following someone through a secure door" },
          { id: "3", label: "Exchanging a service for information" },
        ],
      }),
      hints: JSON.stringify(["Pretexting involves impersonation", "Baiting uses temptation"]),
      answer: JSON.stringify({ pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] }),
      explanation: "Social engineering exploits human psychology rather than technical vulnerabilities.",
    },
    {
      roomId: createdRooms["phishing-defense"],
      title: "Phishing Response Steps",
      description: "Order the correct steps when you suspect a phishing email.",
      type: PuzzleType.SEQUENCE,
      order: 4,
      basePoints: 130,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Do not click any links" },
          { id: "1", label: "Report to IT security" },
          { id: "2", label: "Verify sender through separate channel" },
          { id: "3", label: "Delete or quarantine the email" },
          { id: "4", label: "Warn colleagues if widespread" },
        ],
        categories: [
          { id: "step-1", label: "Step 1" },
          { id: "step-2", label: "Step 2" },
          { id: "step-3", label: "Step 3" },
          { id: "step-4", label: "Step 4" },
          { id: "step-5", label: "Step 5" },
        ],
      }),
      hints: JSON.stringify(["First, avoid making it worse", "Report before deleting evidence"]),
      answer: JSON.stringify({ order: [0, 2, 1, 3, 4] }),
      explanation: "Don't click, verify, report, quarantine, then alert others.",
    },
  ];

  const room4Puzzles = [
    {
      roomId: createdRooms["network-security"],
      title: "Firewall Rule Analysis",
      description: "Identify the correct firewall rule to block a threat while allowing legitimate traffic.",
      type: PuzzleType.MULTIPLE_CHOICE,
      order: 1,
      basePoints: 100,
      timeLimit: 120,
      config: JSON.stringify({
        question: "A server should only accept HTTPS traffic from the internet. Which firewall rule is correct?",
        options: [
          { id: "0", text: "Allow all inbound traffic on all ports" },
          { id: "1", text: "Allow inbound TCP port 443, deny all other inbound" },
          { id: "2", text: "Allow inbound TCP port 80, deny all other inbound" },
          { id: "3", text: "Deny all inbound and outbound traffic" },
        ],
      }),
      hints: JSON.stringify(["HTTPS uses port 443", "Principle of least privilege"]),
      answer: JSON.stringify({ correct: 1 }),
      explanation: "HTTPS uses TCP port 443. A secure firewall allows only necessary ports and denies everything else.",
    },
    {
      roomId: createdRooms["network-security"],
      title: "Network Threat Classification",
      description: "Classify network attacks by their type.",
      type: PuzzleType.DRAG_DROP,
      order: 2,
      basePoints: 130,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "SYN flood" },
          { id: "1", label: "ARP spoofing" },
          { id: "2", label: "DNS poisoning" },
          { id: "3", label: "Packet sniffing" },
          { id: "4", label: "Ping of death" },
          { id: "5", label: "Rogue access point" },
        ],
        categories: [
          { id: "dos", label: "Denial of Service" },
          { id: "mitm", label: "Man-in-the-Middle" },
          { id: "recon", label: "Reconnaissance" },
        ],
      }),
      hints: JSON.stringify(["SYN floods overwhelm servers", "ARP spoofing intercepts traffic"]),
      answer: JSON.stringify({ mapping: [0, 1, 1, 2, 0, 1] }),
      explanation: "DoS attacks disrupt availability, MITM intercepts communications, recon gathers intelligence.",
    },
    {
      roomId: createdRooms["network-security"],
      title: "VPN & Encryption Protocols",
      description: "Match network security protocols to their purposes.",
      type: PuzzleType.MATCHING,
      order: 3,
      basePoints: 120,
      timeLimit: 150,
      config: JSON.stringify({
        leftItems: [
          { id: "0", label: "WPA3" },
          { id: "1", label: "IPSec" },
          { id: "2", label: "SSH" },
          { id: "3", label: "802.1X" },
        ],
        rightItems: [
          { id: "0", label: "Wi-Fi encryption" },
          { id: "1", label: "VPN tunnel encryption" },
          { id: "2", label: "Secure remote access" },
          { id: "3", label: "Network access control" },
        ],
      }),
      hints: JSON.stringify(["WPA is for wireless", "802.1X authenticates devices on a network"]),
      answer: JSON.stringify({ pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] }),
      explanation: "Each protocol secures a different layer of network communication.",
    },
    {
      roomId: createdRooms["network-security"],
      title: "Secure Network Setup",
      description: "Order the steps to set up a secure network segment.",
      type: PuzzleType.SEQUENCE,
      order: 4,
      basePoints: 140,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Define network segments (VLANs)" },
          { id: "1", label: "Configure firewall rules between segments" },
          { id: "2", label: "Enable intrusion detection (IDS)" },
          { id: "3", label: "Set up network monitoring" },
          { id: "4", label: "Test and validate connectivity" },
        ],
        categories: [
          { id: "step-1", label: "Step 1" },
          { id: "step-2", label: "Step 2" },
          { id: "step-3", label: "Step 3" },
          { id: "step-4", label: "Step 4" },
          { id: "step-5", label: "Step 5" },
        ],
      }),
      hints: JSON.stringify(["Segment before filtering", "Monitor after setup"]),
      answer: JSON.stringify({ order: [0, 1, 2, 3, 4] }),
      explanation: "Segment first, then apply controls, detection, monitoring, and finally validate.",
    },
  ];

  const room5Puzzles = [
    {
      roomId: createdRooms["insider-threat"],
      title: "Insider Threat Indicators",
      description: "Identify which behaviors are potential insider threat indicators.",
      type: PuzzleType.MULTIPLE_CHOICE,
      order: 1,
      basePoints: 100,
      timeLimit: 120,
      config: JSON.stringify({
        question: "Which behavior is the STRONGEST indicator of a potential insider threat?",
        options: [
          { id: "0", text: "Working late occasionally" },
          { id: "1", text: "Accessing files outside their role repeatedly" },
          { id: "2", text: "Asking a colleague for help" },
          { id: "3", text: "Using a personal phone at work" },
        ],
      }),
      hints: JSON.stringify(["Focus on access patterns", "Need-to-know principle"]),
      answer: JSON.stringify({ correct: 1 }),
      explanation: "Repeatedly accessing files outside one's role violates least privilege and is a key insider threat indicator.",
    },
    {
      roomId: createdRooms["insider-threat"],
      title: "Access Control Models",
      description: "Match access control models to their descriptions.",
      type: PuzzleType.MATCHING,
      order: 2,
      basePoints: 120,
      timeLimit: 150,
      config: JSON.stringify({
        leftItems: [
          { id: "0", label: "RBAC" },
          { id: "1", label: "MAC" },
          { id: "2", label: "DAC" },
          { id: "3", label: "ABAC" },
        ],
        rightItems: [
          { id: "0", label: "Permissions based on job function" },
          { id: "1", label: "System-enforced classification labels" },
          { id: "2", label: "Owner controls access to their resources" },
          { id: "3", label: "Policies based on user attributes" },
        ],
      }),
      hints: JSON.stringify(["RBAC = Role-Based", "MAC is used in military systems"]),
      answer: JSON.stringify({ pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] }),
      explanation: "Different models balance security and flexibility for different environments.",
    },
    {
      roomId: createdRooms["insider-threat"],
      title: "Threat Scenario Classification",
      description: "Classify insider actions by risk level.",
      type: PuzzleType.DRAG_DROP,
      order: 3,
      basePoints: 130,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Emailing files to personal account" },
          { id: "1", label: "Forgetting to lock workstation" },
          { id: "2", label: "Copying database to USB drive" },
          { id: "3", label: "Sharing password with teammate" },
          { id: "4", label: "Downloading sensitive docs before resignation" },
        ],
        categories: [
          { id: "low", label: "Low Risk" },
          { id: "medium", label: "Medium Risk" },
          { id: "high", label: "High Risk" },
        ],
      }),
      hints: JSON.stringify(["Data exfiltration is high risk", "Consider intent vs negligence"]),
      answer: JSON.stringify({ mapping: [2, 0, 2, 1, 2] }),
      explanation: "Intentional data exfiltration is high risk; negligence is lower but still needs addressing.",
    },
    {
      roomId: createdRooms["insider-threat"],
      title: "Insider Threat Response",
      description: "Order the steps for responding to a suspected insider threat.",
      type: PuzzleType.SEQUENCE,
      order: 4,
      basePoints: 140,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Document observed behavior" },
          { id: "1", label: "Report to security team" },
          { id: "2", label: "Preserve evidence and logs" },
          { id: "3", label: "Restrict access if immediate risk" },
          { id: "4", label: "Conduct formal investigation" },
        ],
        categories: [
          { id: "step-1", label: "Step 1" },
          { id: "step-2", label: "Step 2" },
          { id: "step-3", label: "Step 3" },
          { id: "step-4", label: "Step 4" },
          { id: "step-5", label: "Step 5" },
        ],
      }),
      hints: JSON.stringify(["Document first", "Don't confront the individual directly"]),
      answer: JSON.stringify({ order: [0, 1, 2, 3, 4] }),
      explanation: "Document, report, preserve evidence, restrict access if needed, then investigate formally.",
    },
  ];

  const room6Puzzles = [
    {
      roomId: createdRooms["incident-response"],
      title: "Incident Severity Classification",
      description: "Classify security incidents by severity level.",
      type: PuzzleType.DRAG_DROP,
      order: 1,
      basePoints: 120,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Ransomware encrypting production servers" },
          { id: "1", label: "Phishing email reported by employee" },
          { id: "2", label: "Failed login attempts from single IP" },
          { id: "3", label: "Active data exfiltration detected" },
          { id: "4", label: "Unpatched vulnerability discovered" },
        ],
        categories: [
          { id: "critical", label: "Critical" },
          { id: "high", label: "High" },
          { id: "medium", label: "Medium" },
          { id: "low", label: "Low" },
        ],
      }),
      hints: JSON.stringify(["Active attacks are critical", "Potential threats are lower severity"]),
      answer: JSON.stringify({ mapping: [0, 2, 3, 0, 1] }),
      explanation: "Active attacks on production systems are critical; potential threats rank lower.",
    },
    {
      roomId: createdRooms["incident-response"],
      title: "IR Framework Phases",
      description: "Order the NIST incident response lifecycle phases.",
      type: PuzzleType.SEQUENCE,
      order: 2,
      basePoints: 150,
      timeLimit: 180,
      config: JSON.stringify({
        items: [
          { id: "0", label: "Preparation" },
          { id: "1", label: "Detection & Analysis" },
          { id: "2", label: "Containment" },
          { id: "3", label: "Eradication" },
          { id: "4", label: "Recovery" },
          { id: "5", label: "Post-Incident Review" },
        ],
        categories: [
          { id: "step-1", label: "Phase 1" },
          { id: "step-2", label: "Phase 2" },
          { id: "step-3", label: "Phase 3" },
          { id: "step-4", label: "Phase 4" },
          { id: "step-5", label: "Phase 5" },
          { id: "step-6", label: "Phase 6" },
        ],
      }),
      hints: JSON.stringify(["Preparation comes before any incident", "You must detect before you can contain"]),
      answer: JSON.stringify({ order: [0, 1, 2, 3, 4, 5] }),
      explanation: "NIST IR lifecycle: Prepare, Detect/Analyze, Contain, Eradicate, Recover, Review.",
    },
    {
      roomId: createdRooms["incident-response"],
      title: "Containment Strategies",
      description: "Match containment strategies to their scenarios.",
      type: PuzzleType.MATCHING,
      order: 3,
      basePoints: 130,
      timeLimit: 150,
      config: JSON.stringify({
        leftItems: [
          { id: "0", label: "Network isolation" },
          { id: "1", label: "Account disable" },
          { id: "2", label: "DNS sinkhole" },
          { id: "3", label: "Backup restoration" },
        ],
        rightItems: [
          { id: "0", label: "Compromised server spreading malware" },
          { id: "1", label: "Stolen employee credentials in use" },
          { id: "2", label: "Malware calling command & control server" },
          { id: "3", label: "Ransomware encrypted file shares" },
        ],
      }),
      hints: JSON.stringify(["Isolate to stop lateral movement", "Sinkhole redirects malicious DNS"]),
      answer: JSON.stringify({ pairs: [[0, 0], [1, 1], [2, 2], [3, 3]] }),
      explanation: "Different incidents require different containment approaches based on the attack vector.",
    },
    {
      roomId: createdRooms["incident-response"],
      title: "Evidence Handling",
      description: "Identify the correct approach to digital forensic evidence.",
      type: PuzzleType.MULTIPLE_CHOICE,
      order: 4,
      basePoints: 100,
      timeLimit: 120,
      config: JSON.stringify({
        question: "When collecting evidence from a compromised system, what should you do FIRST?",
        options: [
          { id: "0", text: "Reboot the system to clear malware" },
          { id: "1", text: "Create a forensic image of volatile memory" },
          { id: "2", text: "Delete suspicious files" },
          { id: "3", text: "Update the antivirus and run a scan" },
        ],
      }),
      hints: JSON.stringify(["Volatile data is lost on reboot", "Preservation before remediation"]),
      answer: JSON.stringify({ correct: 1 }),
      explanation: "Volatile memory contains critical evidence (running processes, network connections) that is lost on reboot.",
    },
  ];

  for (const p of [...room1Puzzles, ...room2Puzzles, ...room3Puzzles, ...room4Puzzles, ...room5Puzzles, ...room6Puzzles]) { await prisma.puzzle.create({ data: p }); }

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
