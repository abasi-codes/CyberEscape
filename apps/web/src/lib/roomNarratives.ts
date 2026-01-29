export interface RoomNarrative {
  intro: {
    title: string;
    situation: string;
    objective: string;
  };
  puzzleContexts: Record<string, string>;
  debrief: {
    success: string;
    failure: string;
    learned: string[];
  };
}

const narratives: Record<string, RoomNarrative> = {
  'password-auth': {
    intro: {
      title: 'ACCESS DENIED',
      situation: "You've infiltrated CyberCorp's outer perimeter, but their authentication systems stand between you and the core network. The clock is ticking - security teams are running diagnostics.",
      objective: 'Bypass authentication systems to access the core network before you\'re detected.',
    },
    puzzleContexts: {
      PASSWORD_STRENGTH: 'The system requires a password that meets strict security policies. Analyze the requirements carefully.',
      MULTIPLE_CHOICE: 'A security quiz stands between you and the next level. One wrong answer triggers an alert.',
      MATCHING: 'Match the authentication methods to their descriptions to prove your security knowledge.',
    },
    debrief: {
      success: 'Excellent work, agent. You\'ve successfully bypassed CyberCorp\'s authentication layer. The core network awaits.',
      failure: 'Security teams detected your intrusion. The connection has been terminated. Better luck next time.',
      learned: [
        'Strong passwords combine length, complexity, and uniqueness',
        'Multi-factor authentication provides an additional security layer',
        'Social engineering often bypasses technical controls',
      ],
    },
  },

  'phishing': {
    intro: {
      title: 'SUSPICIOUS INBOX',
      situation: "CyberCorp's internal email system has been compromised. Attackers are sending phishing emails to executives. You've been brought in to identify and neutralize the threats.",
      objective: 'Analyze incoming emails and correctly identify phishing attempts before employees fall victim.',
    },
    puzzleContexts: {
      PHISHING_INBOX: 'Review each email carefully. Look for red flags: urgent language, suspicious links, and unusual sender addresses.',
      PHISHING_CLASSIFICATION: 'Classify these communications - determine which are legitimate and which are malicious.',
      SPOT_DIFFERENCE: 'Compare these two interfaces. The fake one contains subtle differences that reveal its true nature.',
    },
    debrief: {
      success: 'You\'ve successfully identified all phishing attempts. CyberCorp\'s executives have been warned and the attack has been neutralized.',
      failure: 'Some phishing emails slipped through. Credentials were compromised. Always stay vigilant.',
      learned: [
        'Check sender email addresses carefully for impersonation',
        'Hover over links before clicking to verify destinations',
        'Be suspicious of urgent requests for sensitive information',
        'When in doubt, verify through a separate communication channel',
      ],
    },
  },

  'network-security': {
    intro: {
      title: 'NETWORK BREACH',
      situation: "Unauthorized traffic has been detected on CyberCorp's network. An advanced threat actor is attempting to exfiltrate sensitive data. You must secure the network before it's too late.",
      objective: 'Configure firewall rules and network policies to stop the breach while maintaining business operations.',
    },
    puzzleContexts: {
      NETWORK_MAZE: 'Navigate through the network diagram. Block malicious paths while keeping legitimate traffic flowing.',
      DRAG_DROP: 'Arrange these firewall rules in the correct order. Remember: order matters in access control lists.',
      SEQUENCE: 'Place these incident response steps in the correct order to contain the breach.',
    },
    debrief: {
      success: 'Network secured. The threat actor has been blocked and the exfiltration attempt has failed. CyberCorp\'s data remains safe.',
      failure: 'The attacker found an unprotected path. Data has been exfiltrated. Review network segmentation practices.',
      learned: [
        'Defense in depth uses multiple security layers',
        'Firewall rule order matters - most specific rules first',
        'Network segmentation limits lateral movement',
        'Monitor for unusual outbound traffic patterns',
      ],
    },
  },

  'incident-response': {
    intro: {
      title: 'ACTIVE BREACH',
      situation: "Red alert! CyberCorp's SOC has detected an active intrusion. Systems are being encrypted, and the threat actor is still inside the network. This is not a drill.",
      objective: 'Lead the incident response. Contain the threat, preserve evidence, and restore operations.',
    },
    puzzleContexts: {
      INCIDENT_RESPONSE: 'Prioritize your actions carefully. Wrong moves could destroy evidence or accelerate the attack.',
      SIMULATION: 'Real-time decisions are required. Each choice affects the outcome of the incident.',
      ROLE_PLAY_SCENARIO: 'Communicate with stakeholders. Your messages will shape the organization\'s response.',
    },
    debrief: {
      success: 'Incident contained. Evidence preserved. Systems restored. Post-incident review scheduled. Outstanding work under pressure.',
      failure: 'The incident spiraled out of control. Lessons learned have been documented for future reference.',
      learned: [
        'Preparation and planning are crucial before incidents occur',
        'Containment should balance speed with evidence preservation',
        'Clear communication with stakeholders prevents panic',
        'Document everything for post-incident analysis',
      ],
    },
  },

  'data-protection': {
    intro: {
      title: 'DATA AT RISK',
      situation: "CyberCorp is undergoing a compliance audit. Sensitive customer data has been found in unexpected locations. You must classify and protect the data before regulators arrive.",
      objective: 'Identify sensitive data, apply appropriate protections, and ensure compliance with regulations.',
    },
    puzzleContexts: {
      DRAG_DROP_CLASSIFICATION: 'Classify these data types by sensitivity level. Privacy regulations require proper handling.',
      MATCHING: 'Match data types to their appropriate protection measures.',
      MULTIPLE_CHOICE: 'Answer compliance questions correctly to satisfy the auditors.',
    },
    debrief: {
      success: 'Audit passed. Data properly classified and protected. CyberCorp maintains customer trust and regulatory compliance.',
      failure: 'Compliance violations discovered. Remediation required. Customer trust has been impacted.',
      learned: [
        'Data classification is the foundation of data protection',
        'Different data types require different controls',
        'Compliance is an ongoing process, not a one-time event',
        'Privacy by design prevents problems before they occur',
      ],
    },
  },

  'insider-threat': {
    intro: {
      title: 'TRUST BETRAYED',
      situation: "Behavioral analytics have flagged suspicious activity from inside CyberCorp. Someone with authorized access may be working against the company. The investigation must be discreet.",
      objective: 'Analyze user behavior patterns and identify the insider threat without alerting them.',
    },
    puzzleContexts: {
      SPOT_DIFFERENCE: 'Compare normal and suspicious access patterns. Subtle anomalies reveal insider threats.',
      SEQUENCE: 'Reconstruct the timeline of events. When did the suspicious activity begin?',
      ROLE_PLAY_SCENARIO: 'Interview potential subjects. Your approach will determine if they cooperate or flee.',
    },
    debrief: {
      success: 'Insider identified and neutralized. Evidence collected for prosecution. CyberCorp\'s secrets remain safe.',
      failure: 'The insider was alerted and covered their tracks. Some data may have been compromised.',
      learned: [
        'Insider threats often bypass perimeter security',
        'Behavioral baselines help identify anomalies',
        'Least privilege limits potential damage',
        'Separation of duties prevents single points of failure',
      ],
    },
  },

  'default': {
    intro: {
      title: 'SECURITY CHALLENGE',
      situation: "You've been called in to test CyberCorp's security. Show them what you've got.",
      objective: 'Complete the security challenges to prove your expertise.',
    },
    puzzleContexts: {},
    debrief: {
      success: 'Challenge complete. You\'ve demonstrated strong security knowledge.',
      failure: 'Not quite there yet. Review the material and try again.',
      learned: ['Security is a continuous learning process'],
    },
  },
};

export function getRoomNarrative(roomName: string): RoomNarrative {
  const lowerName = roomName.toLowerCase();

  if (lowerName.includes('password') || lowerName.includes('auth')) {
    return narratives['password-auth'];
  }
  if (lowerName.includes('phishing') || lowerName.includes('email')) {
    return narratives['phishing'];
  }
  if (lowerName.includes('network') || lowerName.includes('firewall')) {
    return narratives['network-security'];
  }
  if (lowerName.includes('incident') || lowerName.includes('breach') || lowerName.includes('response')) {
    return narratives['incident-response'];
  }
  if (lowerName.includes('data') || lowerName.includes('privacy') || lowerName.includes('protect')) {
    return narratives['data-protection'];
  }
  if (lowerName.includes('insider') || lowerName.includes('threat')) {
    return narratives['insider-threat'];
  }

  return narratives['default'];
}

export function getPuzzleContext(roomName: string, puzzleType: string): string | null {
  const narrative = getRoomNarrative(roomName);
  return narrative.puzzleContexts[puzzleType] || null;
}
