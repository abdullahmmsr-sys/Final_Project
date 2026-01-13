/**
 * Policy Templates Data
 * SANS/CRF Information Security Policies and Standards
 * NCA Cybersecurity Toolkit Templates
 */

export const policyTemplates = [
  {
    id: 1,
    name: "Access Management Policy",
    filename: "SANS_Access_Management_Policy_April2025 (1).pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Establishes a comprehensive framework for controlling and managing user access to systems, applications, and data resources. Covers authentication, authorization, access provisioning, and periodic access reviews.",
    tags: ["Access Control", "Authentication", "Authorization", "User Management"],
    source: "SANS"
  },
  {
    id: 2,
    name: "Acceptable Encryption Standard",
    filename: "SANS_Acceptable_Encryption_Standard_April2025.pdf",
    category: "APPLICATION",
    description: "Defines approved encryption algorithms, key lengths, and cryptographic protocols for protecting data at rest and in transit. Ensures compliance with industry standards for data protection.",
    tags: ["Encryption", "Cryptography", "Data Protection", "TLS/SSL"],
    source: "SANS"
  },
  {
    id: 3,
    name: "Acceptable Use Standard",
    filename: "SANS_Acceptable_Use_Standard_April2025.pdf",
    category: "GOVERNANCE",
    description: "Outlines acceptable and prohibited uses of organizational IT resources including computers, networks, email, and internet. Establishes user responsibilities and consequences for violations.",
    tags: ["User Behavior", "IT Resources", "Compliance", "Ethics"],
    source: "SANS"
  },
  {
    id: 4,
    name: "Acquisition Assessment Standard",
    filename: "SANS_Acquisition_Assessment_Standard_April2025.pdf",
    category: "GOVERNANCE",
    description: "Provides guidelines for security assessment during mergers, acquisitions, and procurement of new systems. Ensures due diligence in evaluating cybersecurity risks of acquired assets.",
    tags: ["Due Diligence", "M&A", "Risk Assessment", "Procurement"],
    source: "SANS"
  },
  {
    id: 5,
    name: "Artificial Intelligence Acceptable Use Standard",
    filename: "SANS_Artificial_Intelligence_Standard_April2025.pdf",
    category: "APPLICATION",
    description: "Establishes guidelines for responsible use of AI and machine learning systems. Covers data privacy, bias mitigation, transparency, and ethical considerations in AI deployments.",
    tags: ["AI", "Machine Learning", "Ethics", "Data Privacy"],
    source: "SANS"
  },
  {
    id: 6,
    name: "Asset Management Policy",
    filename: "SANS_Asset_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Defines requirements for inventory, classification, and lifecycle management of IT assets. Ensures proper tracking, ownership assignment, and disposal of hardware and software assets.",
    tags: ["Inventory", "Asset Tracking", "Lifecycle", "Classification"],
    source: "SANS"
  },
  {
    id: 7,
    name: "Cloud Service Provider Management Policy",
    filename: "SANS_Cloud_Service_Provider_Management_Policy_April2025.pdf",
    category: "APPLICATION",
    description: "Establishes requirements for selecting, managing, and monitoring cloud service providers. Covers security assessments, contract requirements, and ongoing vendor management.",
    tags: ["Cloud Security", "Vendor Management", "SaaS", "IaaS"],
    source: "SANS"
  },
  {
    id: 8,
    name: "Configuration Management Policy",
    filename: "SANS_Configuration_Management_Policy_April2025.pdf",
    category: "COMPUTE",
    description: "Defines standards for secure configuration of systems, applications, and network devices. Includes baseline configurations, change management, and configuration monitoring.",
    tags: ["Hardening", "Baselines", "Change Management", "Standards"],
    source: "SANS"
  },
  {
    id: 9,
    name: "Data Management Policy",
    filename: "SANS_Data_Inventory_Management_Policy_April2025.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Establishes requirements for data classification, handling, retention, and disposal. Ensures proper protection of sensitive data throughout its lifecycle.",
    tags: ["Data Classification", "Retention", "Privacy", "Handling"],
    source: "SANS"
  },
  {
    id: 10,
    name: "Database Credentials Standard",
    filename: "SANS_Database_Credentials_Standard_April2025.pdf",
    category: "APPLICATION",
    description: "Defines security requirements for database authentication and credential management. Covers password policies, service accounts, and secure storage of database credentials.",
    tags: ["Database Security", "Credentials", "Service Accounts", "Authentication"],
    source: "SANS"
  },
  {
    id: 11,
    name: "Education Management Policy",
    filename: "SANS_Education_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Establishes requirements for cybersecurity awareness training and education programs. Covers training frequency, content requirements, and effectiveness measurement.",
    tags: ["Training", "Awareness", "Education", "Phishing"],
    source: "SANS"
  },
  {
    id: 12,
    name: "Email Management Policy",
    filename: "SANS_Email_Management_Policy_April2025.pdf",
    category: "APPLICATION",
    description: "Defines security controls for email systems including filtering, encryption, retention, and acceptable use. Addresses phishing prevention and email-based threat protection.",
    tags: ["Email Security", "Phishing", "Spam", "Encryption"],
    source: "SANS"
  },
  {
    id: 13,
    name: "Identity Management Policy",
    filename: "SANS_Identity_Management_Policy_April2025.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Establishes standards for identity lifecycle management including provisioning, de-provisioning, and identity verification. Covers SSO, MFA, and identity federation.",
    tags: ["IAM", "SSO", "MFA", "Identity Lifecycle"],
    source: "SANS"
  },
  {
    id: 14,
    name: "Internal Network Access Management Policy",
    filename: "SANS_Internal_Network_Access_Management_Policy_April2025.pdf",
    category: "NETWORK",
    description: "Defines controls for internal network access including segmentation, VLANs, and network access control. Establishes requirements for secure internal communications.",
    tags: ["Network Segmentation", "NAC", "VLAN", "Internal Security"],
    source: "SANS"
  },
  {
    id: 15,
    name: "Internet Acceptable Use Standard",
    filename: "SANS_Internet_Usage_Standard_April2025.pdf",
    category: "NETWORK",
    description: "Establishes guidelines for acceptable internet usage including web filtering, bandwidth management, and prohibited activities. Covers personal use policies and monitoring.",
    tags: ["Web Filtering", "Bandwidth", "Monitoring", "Usage Policy"],
    source: "SANS"
  },
  {
    id: 16,
    name: "Log Management Policy",
    filename: "SANS_Log_Management_Policy_April2025.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Defines requirements for security logging, log retention, and log analysis. Covers centralized logging, SIEM integration, and audit trail requirements.",
    tags: ["Logging", "SIEM", "Audit Trail", "Monitoring"],
    source: "SANS"
  },
  {
    id: 17,
    name: "Mobile Device Management Policy",
    filename: "SANS_Mobile_Device_Management_Policy_April2025.pdf",
    category: "COMPUTE",
    description: "Establishes security requirements for mobile devices including smartphones and tablets. Covers MDM solutions, BYOD policies, and mobile application security.",
    tags: ["MDM", "BYOD", "Mobile Security", "App Security"],
    source: "SANS"
  },
  {
    id: 18,
    name: "Network Device Management Policy",
    filename: "SANS_Network_Device_Management_Policy_April2025.docx",
    category: "NETWORK",
    description: "Defines security standards for network infrastructure devices including routers, switches, and firewalls. Covers configuration, patching, and access controls.",
    tags: ["Routers", "Switches", "Firewalls", "Network Infrastructure"],
    source: "SANS"
  },
  {
    id: 19,
    name: "Password Construction Standard",
    filename: "SANS_Password_Construction_Standard_April2025.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Establishes password complexity requirements, rotation policies, and secure password practices. Covers passphrases, password managers, and multi-factor authentication.",
    tags: ["Passwords", "Complexity", "MFA", "Authentication"],
    source: "SANS"
  },
  {
    id: 20,
    name: "Perimeter Network Access Management Policy",
    filename: "SANS_Perimeter_Network_Access_Management_Policy_April2025.pdf",
    category: "NETWORK",
    description: "Defines controls for network perimeter security including firewalls, DMZ, and remote access. Establishes requirements for secure external connectivity.",
    tags: ["Firewall", "DMZ", "VPN", "Perimeter Security"],
    source: "SANS"
  },
  {
    id: 21,
    name: "Physical Security Management Policy",
    filename: "SANS_Physical_Security_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Establishes requirements for physical access controls, facility security, and environmental protections. Covers badge access, surveillance, and visitor management.",
    tags: ["Physical Access", "Surveillance", "Facility Security", "Environmental"],
    source: "SANS"
  },
  {
    id: 22,
    name: "Privacy Management Policy",
    filename: "SANS_Privacy_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Defines privacy requirements for personal data collection, processing, and storage. Ensures compliance with privacy regulations like GDPR and CCPA.",
    tags: ["Privacy", "GDPR", "PII", "Data Protection"],
    source: "SANS"
  },
  {
    id: 23,
    name: "Privileged Account Management Policy",
    filename: "SANS_Privileged_Account_Management_Policy_April2025.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Establishes controls for privileged accounts including admin access, service accounts, and emergency access. Covers PAM solutions and just-in-time access.",
    tags: ["PAM", "Admin Access", "Service Accounts", "JIT Access"],
    source: "SANS"
  },
  {
    id: 24,
    name: "Program Management Policy",
    filename: "SANS_Program_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Defines the overall cybersecurity program structure, governance, and metrics. Establishes roles, responsibilities, and program oversight requirements.",
    tags: ["Governance", "Metrics", "Program", "Oversight"],
    source: "SANS"
  },
  {
    id: 25,
    name: "Resilience Management Policy",
    filename: "SANS_Resilience_Management_Policy_April2025.pdf",
    category: "RESILIENCE",
    description: "Establishes requirements for business continuity, disaster recovery, and incident response. Covers backup strategies, recovery objectives, and resilience testing.",
    tags: ["BCP", "DR", "Incident Response", "Recovery"],
    source: "SANS"
  },
  {
    id: 26,
    name: "Risk Communication Management Policy",
    filename: "SANS_Risk_Communication_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Defines processes for communicating cybersecurity risks to stakeholders. Covers risk reporting, escalation procedures, and board-level communications.",
    tags: ["Risk Reporting", "Communication", "Stakeholders", "Escalation"],
    source: "SANS"
  },
  {
    id: 27,
    name: "Safeguard Implementation Management Policy",
    filename: "SANS_Safeguard_Implementation_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Establishes processes for implementing security controls and safeguards. Covers implementation planning, testing, and documentation requirements.",
    tags: ["Controls", "Implementation", "Testing", "Documentation"],
    source: "SANS"
  },
  {
    id: 28,
    name: "Safeguard Selection Management Policy",
    filename: "SANS_Safeguard_Selection_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Defines criteria for selecting appropriate security controls based on risk assessments. Covers control frameworks, cost-benefit analysis, and prioritization.",
    tags: ["Control Selection", "Risk-Based", "Frameworks", "Prioritization"],
    source: "SANS"
  },
  {
    id: 29,
    name: "Safeguard Validation Management Policy",
    filename: "SANS_Safeguard_Validation_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Establishes requirements for validating security control effectiveness. Covers testing methodologies, audit procedures, and continuous monitoring.",
    tags: ["Validation", "Testing", "Audit", "Monitoring"],
    source: "SANS"
  },
  {
    id: 30,
    name: "Software Development Management Policy",
    filename: "SANS_Software_Development_Management_Policy_April2025.pdf",
    category: "APPLICATION",
    description: "Defines secure software development lifecycle (SDLC) requirements. Covers secure coding practices, code review, and security testing integration.",
    tags: ["SDLC", "Secure Coding", "Code Review", "DevSecOps"],
    source: "SANS"
  },
  {
    id: 31,
    name: "Software Development Vulnerability Management Policy",
    filename: "SANS_Software_Development_Vulnerability_Management_Policy_April2025.pdf",
    category: "APPLICATION",
    description: "Establishes processes for identifying and remediating vulnerabilities in developed software. Covers SAST, DAST, and vulnerability disclosure.",
    tags: ["SAST", "DAST", "Vulnerability", "Remediation"],
    source: "SANS"
  },
  {
    id: 32,
    name: "Software Management Policy",
    filename: "SANS_Software_Management_Policy_April2025.pdf",
    category: "COMPUTE",
    description: "Defines requirements for software inventory, licensing, and lifecycle management. Covers approved software lists, patching, and end-of-life management.",
    tags: ["Software Inventory", "Licensing", "Patching", "Lifecycle"],
    source: "SANS"
  },
  {
    id: 33,
    name: "System Protection Management Policy",
    filename: "SANS_System_Protection_Management_Policy_April2025.pdf",
    category: "COMPUTE",
    description: "Establishes requirements for endpoint protection including antivirus, EDR, and host-based controls. Covers system hardening and protection monitoring.",
    tags: ["Endpoint Protection", "EDR", "Antivirus", "Hardening"],
    source: "SANS"
  },
  {
    id: 34,
    name: "Technology Equipment Disposal Standard",
    filename: "SANS_Technology_Equipment_Disposal_Standard_April2025.pdf",
    category: "COMPUTE",
    description: "Defines secure disposal requirements for IT equipment and storage media. Covers data sanitization, destruction methods, and chain of custody.",
    tags: ["Disposal", "Data Sanitization", "E-Waste", "Destruction"],
    source: "SANS"
  },
  {
    id: 35,
    name: "Third-Party Risk Management Policy",
    filename: "SANS_Third_Party_Management_Policy_April2025.pdf",
    category: "GOVERNANCE",
    description: "Establishes requirements for managing third-party and vendor security risks. Covers vendor assessments, contract requirements, and ongoing monitoring.",
    tags: ["Vendor Risk", "Third Party", "Supply Chain", "Assessment"],
    source: "SANS"
  },
  {
    id: 36,
    name: "Vulnerability Management Policy",
    filename: "SANS_Vulnerability_Management_Policy_April2025.pdf",
    category: "COMPUTE",
    description: "Defines processes for vulnerability scanning, assessment, and remediation. Covers scanning frequency, risk ranking, and patch management integration.",
    tags: ["Vulnerability Scanning", "Patching", "Risk Ranking", "Remediation"],
    source: "SANS"
  },
  // NCA Cybersecurity Toolkit Templates
  {
    id: 37,
    name: "Cybersecurity Requirements in IT Projects Checklist",
    filename: "Checklist_Cybersecurity-Requirements-in-IT-Projects-and-Change-Management_template_en.pdf",
    category: "GOVERNANCE",
    description: "A comprehensive checklist for integrating cybersecurity requirements into IT projects and change management processes. Ensures security considerations are addressed throughout project lifecycle.",
    tags: ["IT Projects", "Change Management", "Checklist", "Requirements"],
    source: "NCA Toolkit"
  },
  {
    id: 38,
    name: "Cybersecurity Requirements in Software Development Checklist",
    filename: "Checklist_Cybersecurity-Requirements-in-Software-Development_template_en-.pdf",
    category: "APPLICATION",
    description: "Checklist for implementing cybersecurity requirements during software development. Covers secure coding practices, testing requirements, and security validation.",
    tags: ["Software Development", "SDLC", "Secure Coding", "Checklist"],
    source: "NCA Toolkit"
  },
  {
    id: 39,
    name: "Cybersecurity Organizational Structure Template",
    filename: "Cybersecurity_Organizational_Structure_Template_en.pdf",
    category: "GOVERNANCE",
    description: "Template for defining the cybersecurity organizational structure within an organization. Establishes reporting lines, departments, and coordination mechanisms.",
    tags: ["Organization", "Structure", "Governance", "Reporting"],
    source: "NCA Toolkit"
  },
  {
    id: 40,
    name: "Cybersecurity Roles and Responsibilities Template",
    filename: "Cybersecurity_Roles_and_Responsibilities_Template_en.pdf",
    category: "GOVERNANCE",
    description: "Defines cybersecurity roles and responsibilities across the organization. Covers CISO, security analysts, administrators, and business unit responsibilities.",
    tags: ["Roles", "Responsibilities", "RACI", "Accountability"],
    source: "NCA Toolkit"
  },
  {
    id: 41,
    name: "Cybersecurity Steering Committee Document",
    filename: "Cybersecurity_Steering_Committee_Regulating_Document_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Template for establishing and regulating a Cybersecurity Steering Committee. Defines membership, meeting frequency, decision-making authority, and escalation procedures.",
    tags: ["Steering Committee", "Governance", "Decision Making", "Leadership"],
    source: "NCA Toolkit"
  },
  {
    id: 42,
    name: "Cybersecurity Strategy and Roadmap Template",
    filename: "Cybersecurity_Strategy_and_Roadmap_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Template for developing a comprehensive cybersecurity strategy and implementation roadmap. Covers vision, objectives, initiatives, and milestones.",
    tags: ["Strategy", "Roadmap", "Planning", "Objectives"],
    source: "NCA Toolkit"
  },
  {
    id: 43,
    name: "Confidentiality Agreement Form",
    filename: "Form_Confidentiality-Agreement_Template_en.pdf",
    category: "GOVERNANCE",
    description: "Standard confidentiality agreement form for employees, contractors, and third parties. Establishes obligations for protecting sensitive information.",
    tags: ["Confidentiality", "NDA", "Agreement", "Legal"],
    source: "NCA Toolkit"
  },
  {
    id: 44,
    name: "Policy Undertaking Form",
    filename: "Form_Policy-Undertaking_Template.pdf",
    category: "GOVERNANCE",
    description: "Form for employees to acknowledge and commit to following organizational security policies. Documents acceptance of security responsibilities.",
    tags: ["Acknowledgment", "Undertaking", "Compliance", "Employee"],
    source: "NCA Toolkit"
  },
  {
    id: 45,
    name: "Asset Acceptable Use Policy",
    filename: "POLICY_Asset_Acceptable_Use_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy defining acceptable use of organizational assets including hardware, software, and data. Establishes user responsibilities and prohibited activities.",
    tags: ["Acceptable Use", "Assets", "User Behavior", "Compliance"],
    source: "NCA Toolkit"
  },
  {
    id: 46,
    name: "Asset Management Policy",
    filename: "POLICY_Asset_Management_template_en.pdf",
    category: "GOVERNANCE",
    description: "Comprehensive policy for IT asset management including inventory, classification, and lifecycle management. Ensures proper tracking and protection of assets.",
    tags: ["Asset Management", "Inventory", "Classification", "Lifecycle"],
    source: "NCA Toolkit"
  },
  {
    id: 47,
    name: "Backup and Recovery Policy",
    filename: "POLICY_Backup_and_Recovery_template_en.pdf",
    category: "RESILIENCE",
    description: "Policy establishing requirements for data backup, retention, and recovery procedures. Covers backup frequency, testing, and restoration processes.",
    tags: ["Backup", "Recovery", "Data Protection", "Business Continuity"],
    source: "NCA Toolkit"
  },
  {
    id: 48,
    name: "Cloud Computing and Hosting Cybersecurity Policy",
    filename: "POLICY_Cloud_Computing_and_Hosting_Cybersecurity_template_en.pdf",
    category: "APPLICATION",
    description: "Policy for securing cloud computing and hosting environments. Covers cloud security requirements, provider management, and data protection in cloud.",
    tags: ["Cloud Security", "Hosting", "SaaS", "IaaS"],
    source: "NCA Toolkit"
  },
  {
    id: 49,
    name: "Compliance with Cybersecurity Legislation Policy",
    filename: "POLICY_Compliance_With_Cybersecurity_Legislation_And_Regulations_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy ensuring compliance with cybersecurity laws, regulations, and standards. Covers regulatory requirements, compliance monitoring, and reporting.",
    tags: ["Compliance", "Regulations", "Legal", "Standards"],
    source: "NCA Toolkit"
  },
  {
    id: 50,
    name: "Configuration and Hardening Policy",
    filename: "POLICY_Configuration_and_Hardening_template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for secure configuration and hardening of systems and applications. Establishes baseline configurations and security standards.",
    tags: ["Configuration", "Hardening", "Baselines", "Security Standards"],
    source: "NCA Toolkit"
  },
  {
    id: 51,
    name: "Corporate Cybersecurity Policy",
    filename: "POLICY_Corporate-Cybersecurity-Policy_template_en-.pdf",
    category: "GOVERNANCE",
    description: "Master cybersecurity policy establishing the organization's overall security framework, principles, and governance structure.",
    tags: ["Corporate Policy", "Governance", "Framework", "Principles"],
    source: "NCA Toolkit"
  },
  {
    id: 52,
    name: "Cryptography Policy",
    filename: "POLICY_Cryptography_Template_en-.pdf",
    category: "APPLICATION",
    description: "Policy defining cryptographic controls for protecting data. Covers encryption standards, key management, and cryptographic protocols.",
    tags: ["Cryptography", "Encryption", "Key Management", "Data Protection"],
    source: "NCA Toolkit"
  },
  {
    id: 53,
    name: "Cybersecurity Business Continuity Policy",
    filename: "POLICY_Cybersecurity_Business_Continuity_Template_en-.pdf",
    category: "RESILIENCE",
    description: "Policy for maintaining cybersecurity during business continuity events. Covers disaster recovery, incident response, and operational resilience.",
    tags: ["Business Continuity", "Disaster Recovery", "Resilience", "BCP"],
    source: "NCA Toolkit"
  },
  {
    id: 54,
    name: "Cybersecurity Event Logs and Monitoring Policy",
    filename: "POLICY_Cybersecurity_Event_Logs_and_Monitoring_Management_Template-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Policy for security event logging and monitoring. Covers log collection, retention, analysis, and security monitoring requirements.",
    tags: ["Logging", "Monitoring", "SIEM", "Event Management"],
    source: "NCA Toolkit"
  },
  {
    id: 55,
    name: "Cybersecurity Incident and Threat Management Policy",
    filename: "POLICY_Cybersecurity_Incident_and_Threat_Management_Template_en-.pdf",
    category: "RESILIENCE",
    description: "Policy for managing cybersecurity incidents and threats. Covers incident response procedures, threat intelligence, and escalation processes.",
    tags: ["Incident Response", "Threat Management", "Security Operations", "Escalation"],
    source: "NCA Toolkit"
  },
  {
    id: 56,
    name: "Industrial Control Systems Cybersecurity Policy",
    filename: "POLICY_Cybersecurity_Industrial_Controls_Systems_template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for securing Industrial Control Systems (ICS) and Operational Technology (OT). Covers SCADA security, network segmentation, and OT-specific controls.",
    tags: ["ICS", "OT", "SCADA", "Industrial Security"],
    source: "NCA Toolkit"
  },
  {
    id: 57,
    name: "Cybersecurity Review and Audit Policy",
    filename: "POLICY_Cybersecurity_Review_and_Audit_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy for conducting cybersecurity reviews and audits. Covers audit planning, execution, reporting, and remediation tracking.",
    tags: ["Audit", "Review", "Assessment", "Compliance"],
    source: "NCA Toolkit"
  },
  {
    id: 58,
    name: "Cybersecurity Risk Management Policy",
    filename: "POLICY_Cybersecurity_Risk_Management_Template_en---.pdf",
    category: "GOVERNANCE",
    description: "Policy for managing cybersecurity risks. Covers risk identification, assessment, treatment, and monitoring processes.",
    tags: ["Risk Management", "Risk Assessment", "Risk Treatment", "Governance"],
    source: "NCA Toolkit"
  },
  {
    id: 59,
    name: "Data Cybersecurity Policy",
    filename: "POLICY_Data_Cybersecurity_template_en.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Policy for protecting organizational data throughout its lifecycle. Covers data classification, handling, storage, and disposal requirements.",
    tags: ["Data Security", "Classification", "Data Protection", "Privacy"],
    source: "NCA Toolkit"
  },
  {
    id: 60,
    name: "Database Security Policy",
    filename: "POLICY_Database_Security_template_en-.pdf",
    category: "APPLICATION",
    description: "Policy for securing database systems. Covers database access controls, encryption, auditing, and backup requirements.",
    tags: ["Database", "Data Security", "Access Control", "Encryption"],
    source: "NCA Toolkit"
  },
  {
    id: 61,
    name: "Email Security Policy",
    filename: "POLICY_Email_Security_template_en-.pdf",
    category: "APPLICATION",
    description: "Policy for securing email communications. Covers email filtering, encryption, acceptable use, and phishing protection.",
    tags: ["Email Security", "Phishing", "Encryption", "Communication"],
    source: "NCA Toolkit"
  },
  {
    id: 62,
    name: "Human Resources Cybersecurity Policy",
    filename: "POLICY_Human_Resources_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy integrating cybersecurity into HR processes. Covers background checks, security awareness, onboarding, and offboarding procedures.",
    tags: ["HR", "Background Checks", "Onboarding", "Offboarding"],
    source: "NCA Toolkit"
  },
  {
    id: 63,
    name: "Identity and Access Management Policy",
    filename: "POLICY_Identity_and_Access_Management_template_en-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Policy for managing identities and access rights. Covers authentication, authorization, provisioning, and access reviews.",
    tags: ["IAM", "Access Control", "Authentication", "Authorization"],
    source: "NCA Toolkit"
  },
  {
    id: 64,
    name: "Network Security Policy",
    filename: "POLICY_Network_Security_Template_en-.pdf",
    category: "NETWORK",
    description: "Policy for securing network infrastructure. Covers network segmentation, firewall rules, intrusion detection, and network monitoring.",
    tags: ["Network Security", "Firewall", "Segmentation", "IDS/IPS"],
    source: "NCA Toolkit"
  },
  {
    id: 65,
    name: "Patch Management Policy",
    filename: "POLICY_Patch_Management_Template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for managing security patches and updates. Covers patch assessment, testing, deployment, and emergency patching procedures.",
    tags: ["Patch Management", "Updates", "Vulnerability", "Maintenance"],
    source: "NCA Toolkit"
  },
  {
    id: 66,
    name: "Penetration Testing Policy",
    filename: "POLICY_Penetration_Testing_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy for conducting penetration testing. Covers testing scope, methodology, reporting, and remediation requirements.",
    tags: ["Penetration Testing", "Security Testing", "Vulnerability", "Assessment"],
    source: "NCA Toolkit"
  },
  {
    id: 67,
    name: "Physical Security Policy",
    filename: "POLICY_Physical_Security_template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy for physical security of IT assets and facilities. Covers access controls, surveillance, environmental controls, and visitor management.",
    tags: ["Physical Security", "Access Control", "Facilities", "Environmental"],
    source: "NCA Toolkit"
  },
  {
    id: 68,
    name: "Servers Security Policy",
    filename: "POLICY_Servers_Security_template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for securing server infrastructure. Covers server hardening, access controls, monitoring, and maintenance requirements.",
    tags: ["Server Security", "Hardening", "Infrastructure", "Maintenance"],
    source: "NCA Toolkit"
  },
  {
    id: 69,
    name: "Storage Media Policy",
    filename: "POLICY_Storage_Media_Policy_Template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for managing storage media including removable devices. Covers encryption, handling, and disposal of storage media.",
    tags: ["Storage Media", "Removable Media", "Encryption", "Disposal"],
    source: "NCA Toolkit"
  },
  {
    id: 70,
    name: "Third Party Cybersecurity Policy",
    filename: "POLICY_Third_Party_Cybersecurity_template_en-.pdf",
    category: "GOVERNANCE",
    description: "Policy for managing third-party cybersecurity risks. Covers vendor assessments, contract requirements, and ongoing monitoring.",
    tags: ["Third Party", "Vendor Management", "Supply Chain", "Risk"],
    source: "NCA Toolkit"
  },
  {
    id: 71,
    name: "Vulnerabilities Management Policy",
    filename: "POLICY_Vulnerabilities_Management_Template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for managing security vulnerabilities. Covers vulnerability scanning, assessment, prioritization, and remediation.",
    tags: ["Vulnerability Management", "Scanning", "Remediation", "Security"],
    source: "NCA Toolkit"
  },
  {
    id: 72,
    name: "Web Applications Protection Policy",
    filename: "POLICY_Web_Applications_Protection_Template_en-.pdf",
    category: "APPLICATION",
    description: "Policy for protecting web applications. Covers WAF, secure development, testing, and application security monitoring.",
    tags: ["Web Security", "Application Security", "WAF", "OWASP"],
    source: "NCA Toolkit"
  },
  {
    id: 73,
    name: "Workstations, Mobile Devices and BYOD Policy",
    filename: "POLICY_Workstations_and_Mobile_Devices_and_BYOD_Security_Template_en---.pdf",
    category: "COMPUTE",
    description: "Policy for securing workstations, mobile devices, and BYOD. Covers endpoint security, MDM, and personal device requirements.",
    tags: ["Workstation", "Mobile", "BYOD", "Endpoint Security"],
    source: "NCA Toolkit"
  },
  {
    id: 74,
    name: "Anti-Malware Protection Policy",
    filename: "POLICY_anti-Malware_Protection-_template_en-.pdf",
    category: "COMPUTE",
    description: "Policy for protection against malware. Covers antivirus deployment, updates, scanning, and incident response.",
    tags: ["Anti-Malware", "Antivirus", "Endpoint Protection", "Security"],
    source: "NCA Toolkit"
  },
  {
    id: 75,
    name: "Cybersecurity Document Development Procedure",
    filename: "PROCEDURE_Cybersecurity-Document-Development-Procedure_Template_en.pdf",
    category: "GOVERNANCE",
    description: "Procedure for developing cybersecurity policies, standards, and procedures. Covers document lifecycle, approval, and distribution.",
    tags: ["Documentation", "Procedure", "Development", "Governance"],
    source: "NCA Toolkit"
  },
  {
    id: 76,
    name: "Vulnerability Management Procedure",
    filename: "PROCEDURE_Vulnerability-Management-Procedure_Template_en.pdf",
    category: "COMPUTE",
    description: "Step-by-step procedure for vulnerability management. Covers discovery, assessment, remediation, and verification processes.",
    tags: ["Vulnerability", "Procedure", "Remediation", "Process"],
    source: "NCA Toolkit"
  },
  {
    id: 77,
    name: "Cybersecurity Awareness Program",
    filename: "PROGRAM_Cybersecurity-Awareness-Program_Template_en_.pdf",
    category: "GOVERNANCE",
    description: "Template for establishing a cybersecurity awareness program. Covers training content, delivery methods, and effectiveness measurement.",
    tags: ["Awareness", "Training", "Program", "Education"],
    source: "NCA Toolkit"
  },
  {
    id: 78,
    name: "SSDLC Policy",
    filename: "Policy_SSDLC_Policy_template_en-.pdf",
    category: "APPLICATION",
    description: "Policy for Secure Software Development Lifecycle (SSDLC). Covers security requirements, secure coding, testing, and deployment.",
    tags: ["SSDLC", "Secure Development", "DevSecOps", "Application Security"],
    source: "NCA Toolkit"
  },
  {
    id: 79,
    name: "Cybersecurity Audit Procedure",
    filename: "Procedure_Cybersecurity-Audit_Template_en_.pdf",
    category: "GOVERNANCE",
    description: "Procedure for conducting cybersecurity audits. Covers audit planning, execution, evidence collection, and reporting.",
    tags: ["Audit", "Procedure", "Compliance", "Assessment"],
    source: "NCA Toolkit"
  },
  {
    id: 80,
    name: "Cybersecurity Risk Management Procedure",
    filename: "Procedure_Cybersecurity-risk-management_template_en_-.pdf",
    category: "GOVERNANCE",
    description: "Procedure for implementing risk management. Covers risk identification, analysis, evaluation, and treatment processes.",
    tags: ["Risk Management", "Procedure", "Assessment", "Treatment"],
    source: "NCA Toolkit"
  },
  {
    id: 81,
    name: "APT Protection Standard",
    filename: "STANDARD_APT-Standard_Template_en.pdf",
    category: "COMPUTE",
    description: "Standard for protecting against Advanced Persistent Threats (APT). Covers threat detection, prevention, and response measures.",
    tags: ["APT", "Threat Protection", "Advanced Threats", "Security"],
    source: "NCA Toolkit"
  },
  {
    id: 82,
    name: "Asset Classification Standard",
    filename: "STANDARD_Asset_Classification_template_en_-.pdf",
    category: "GOVERNANCE",
    description: "Standard for classifying organizational assets based on sensitivity and criticality. Defines classification levels and handling requirements.",
    tags: ["Asset Classification", "Data Classification", "Sensitivity", "Handling"],
    source: "NCA Toolkit"
  },
  {
    id: 83,
    name: "Asset Management Standard",
    filename: "STANDARD_Asset_Management_template_en_v0.3-.pdf",
    category: "GOVERNANCE",
    description: "Standard for IT asset management implementation. Covers inventory procedures, lifecycle management, and asset tracking.",
    tags: ["Asset Management", "Inventory", "Lifecycle", "Tracking"],
    source: "NCA Toolkit"
  },
  {
    id: 84,
    name: "Backup and Recovery Standard",
    filename: "STANDARD_Backup_and_Recovery_template_en_v0.3.pdf",
    category: "RESILIENCE",
    description: "Standard for implementing backup and recovery controls. Covers backup methods, frequencies, testing, and recovery procedures.",
    tags: ["Backup", "Recovery", "Data Protection", "Business Continuity"],
    source: "NCA Toolkit"
  },
  {
    id: 85,
    name: "Cryptography Standard",
    filename: "STANDARD_Cryptography_Template_en--.pdf",
    category: "APPLICATION",
    description: "Standard for implementing cryptographic controls. Covers algorithms, key lengths, protocols, and key management procedures.",
    tags: ["Cryptography", "Encryption", "Key Management", "Standards"],
    source: "NCA Toolkit"
  },
  {
    id: 86,
    name: "Event Logs and Monitoring Standard",
    filename: "STANDARD_Cybersecurity_Event_Logs_and_Monitoring_Management_Template_en-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Standard for implementing security logging and monitoring. Covers log formats, retention, analysis, and alerting requirements.",
    tags: ["Logging", "Monitoring", "SIEM", "Alerting"],
    source: "NCA Toolkit"
  },
  {
    id: 87,
    name: "DDoS Protection Standard",
    filename: "STANDARD_DDoS-Protection-Standard_Template_en_.pdf",
    category: "NETWORK",
    description: "Standard for protecting against Distributed Denial of Service attacks. Covers detection, mitigation, and response measures.",
    tags: ["DDoS", "Protection", "Network Security", "Availability"],
    source: "NCA Toolkit"
  },
  {
    id: 88,
    name: "Data Loss Prevention Standard",
    filename: "STANDARD_Data-Loss-Prevention_template_en-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Standard for implementing Data Loss Prevention controls. Covers DLP policies, monitoring, and incident response.",
    tags: ["DLP", "Data Protection", "Prevention", "Monitoring"],
    source: "NCA Toolkit"
  },
  {
    id: 89,
    name: "Database Security Standard",
    filename: "STANDARD_Database_Security_template_en-.pdf",
    category: "APPLICATION",
    description: "Standard for securing database systems. Covers access controls, encryption, auditing, and backup requirements.",
    tags: ["Database", "Security Standards", "Access Control", "Encryption"],
    source: "NCA Toolkit"
  },
  {
    id: 90,
    name: "Email Protection Standard",
    filename: "STANDARD_Email_Protection_template_en-.pdf",
    category: "APPLICATION",
    description: "Standard for implementing email security controls. Covers filtering, encryption, authentication, and anti-phishing measures.",
    tags: ["Email Security", "Filtering", "Encryption", "Anti-Phishing"],
    source: "NCA Toolkit"
  },
  {
    id: 91,
    name: "Identity and Access Management Standard",
    filename: "STANDARD_Identity-and-Access-Management_template_en-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Standard for implementing IAM controls. Covers authentication mechanisms, access provisioning, and review procedures.",
    tags: ["IAM", "Authentication", "Access Control", "Provisioning"],
    source: "NCA Toolkit"
  },
  {
    id: 92,
    name: "Malware Protection Standard",
    filename: "STANDARD_Malware_Protection_template_en-.docx",
    category: "COMPUTE",
    description: "Standard for implementing malware protection. Covers antivirus configuration, scanning, updates, and incident response.",
    tags: ["Malware", "Antivirus", "Protection", "Endpoint Security"],
    source: "NCA Toolkit"
  },
  {
    id: 93,
    name: "Mobile Devices Security Standard",
    filename: "STANDARD_Mobile_Devices_Security_Template_en.pdf",
    category: "COMPUTE",
    description: "Standard for securing mobile devices. Covers MDM requirements, encryption, application security, and remote wipe.",
    tags: ["Mobile Security", "MDM", "Encryption", "BYOD"],
    source: "NCA Toolkit"
  },
  {
    id: 94,
    name: "Network Security Standard",
    filename: "STANDARD_Network_Security_Template_en.pdf",
    category: "NETWORK",
    description: "Standard for implementing network security controls. Covers segmentation, firewall rules, IDS/IPS, and monitoring.",
    tags: ["Network Security", "Segmentation", "Firewall", "IDS/IPS"],
    source: "NCA Toolkit"
  },
  {
    id: 95,
    name: "Patch Management Standard",
    filename: "STANDARD_Patch_Management_Template_en.pdf",
    category: "COMPUTE",
    description: "Standard for implementing patch management. Covers patch assessment, testing, deployment, and verification.",
    tags: ["Patch Management", "Updates", "Vulnerability", "Maintenance"],
    source: "NCA Toolkit"
  },
  {
    id: 96,
    name: "Penetration Testing Standard",
    filename: "STANDARD_Penetration_Testing_Template_en-.pdf",
    category: "GOVERNANCE",
    description: "Standard for conducting penetration tests. Covers methodology, scope definition, execution, and reporting.",
    tags: ["Penetration Testing", "Security Testing", "Methodology", "Reporting"],
    source: "NCA Toolkit"
  },
  {
    id: 97,
    name: "Physical Security Standard",
    filename: "STANDARD_Physical-Security_template_en-.pdf",
    category: "GOVERNANCE",
    description: "Standard for implementing physical security controls. Covers access control systems, surveillance, and environmental protection.",
    tags: ["Physical Security", "Access Control", "Surveillance", "Environmental"],
    source: "NCA Toolkit"
  },
  {
    id: 98,
    name: "Secure Configuration and Hardening Standard",
    filename: "STANDARD_Secure-Configuration-and-Hardening_template_en-.pdf",
    category: "COMPUTE",
    description: "Standard for secure system configuration and hardening. Covers baseline configurations, security settings, and validation.",
    tags: ["Configuration", "Hardening", "Baselines", "Security Settings"],
    source: "NCA Toolkit"
  },
  {
    id: 99,
    name: "Servers Security Standard",
    filename: "STANDARD_Servers_Security_template_en-.pdf",
    category: "COMPUTE",
    description: "Standard for server security implementation. Covers hardening, access controls, monitoring, and maintenance.",
    tags: ["Server Security", "Hardening", "Access Control", "Monitoring"],
    source: "NCA Toolkit"
  },
  {
    id: 100,
    name: "Social Media Security Standard",
    filename: "STANDARD_Social-Media-Security-Standard_Template_en.pdf",
    category: "APPLICATION",
    description: "Standard for securing organizational social media presence. Covers account security, content policies, and incident response.",
    tags: ["Social Media", "Account Security", "Content Policy", "Brand Protection"],
    source: "NCA Toolkit"
  },
  {
    id: 101,
    name: "Virtualization Security Standard",
    filename: "STANDARD_Virtualization_Security_Template_en_.pdf",
    category: "COMPUTE",
    description: "Standard for securing virtualized environments. Covers hypervisor security, VM isolation, and virtual network security.",
    tags: ["Virtualization", "Hypervisor", "VM Security", "Isolation"],
    source: "NCA Toolkit"
  },
  {
    id: 102,
    name: "Vulnerabilities Management Standard",
    filename: "STANDARD_Vulnerabilities_Management_Template_en-.pdf",
    category: "COMPUTE",
    description: "Standard for vulnerability management implementation. Covers scanning, assessment, prioritization, and remediation.",
    tags: ["Vulnerability Management", "Scanning", "Remediation", "Prioritization"],
    source: "NCA Toolkit"
  },
  {
    id: 103,
    name: "Data Diode Standard",
    filename: "Standard_Data-Diode-Standard_Template_en.pdf",
    category: "NETWORK",
    description: "Standard for implementing data diodes for one-way data transfer. Covers deployment, configuration, and monitoring.",
    tags: ["Data Diode", "Network Security", "One-Way Transfer", "Isolation"],
    source: "NCA Toolkit"
  },
  {
    id: 104,
    name: "Data Protection Standard",
    filename: "Standard_Data-Protection_template_en_-.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Standard for implementing data protection controls. Covers classification, encryption, handling, and disposal.",
    tags: ["Data Protection", "Classification", "Encryption", "Handling"],
    source: "NCA Toolkit"
  },
  {
    id: 105,
    name: "EDR Standard",
    filename: "Standard_EDR_Template_en_.pdf",
    category: "COMPUTE",
    description: "Standard for Endpoint Detection and Response implementation. Covers EDR deployment, configuration, and incident response.",
    tags: ["EDR", "Endpoint Security", "Detection", "Response"],
    source: "NCA Toolkit"
  },
  {
    id: 106,
    name: "Key Management Standard",
    filename: "Standard_Key-management-standard_template_en_-.pdf",
    category: "APPLICATION",
    description: "Standard for cryptographic key management. Covers key generation, storage, distribution, rotation, and destruction.",
    tags: ["Key Management", "Cryptography", "PKI", "Key Lifecycle"],
    source: "NCA Toolkit"
  },
  {
    id: 107,
    name: "NDR Standard",
    filename: "Standard_NDR_Template_en_v0.9-.pdf",
    category: "NETWORK",
    description: "Standard for Network Detection and Response implementation. Covers NDR deployment, traffic analysis, and threat detection.",
    tags: ["NDR", "Network Security", "Detection", "Threat Hunting"],
    source: "NCA Toolkit"
  },
  {
    id: 108,
    name: "OT/ICS Security Standard",
    filename: "Standard_OT-ICS-Security-Standard_Template_en--.pdf",
    category: "COMPUTE",
    description: "Standard for Operational Technology and Industrial Control Systems security. Covers SCADA, PLC, and OT network security.",
    tags: ["OT", "ICS", "SCADA", "Industrial Security"],
    source: "NCA Toolkit"
  },
  {
    id: 109,
    name: "Privileged Access Workstation Standard",
    filename: "Standard_Privileged-Access-Workstation_Template_en_.pdf",
    category: "IDENTIFY AND ACCESS",
    description: "Standard for Privileged Access Workstations (PAW). Covers secure workstation configuration, access controls, and monitoring.",
    tags: ["PAW", "Privileged Access", "Workstation Security", "Access Control"],
    source: "NCA Toolkit"
  },
  {
    id: 110,
    name: "Proxy Standard",
    filename: "Standard_Proxy_template_en-.pdf",
    category: "NETWORK",
    description: "Standard for proxy server implementation. Covers web filtering, content inspection, and access control policies.",
    tags: ["Proxy", "Web Filtering", "Content Inspection", "Access Control"],
    source: "NCA Toolkit"
  },
  {
    id: 111,
    name: "Secure Coding Standard",
    filename: "Standard_Secure_Coding_standrd-controls_Template_en-.pdf",
    category: "APPLICATION",
    description: "Standard for secure coding practices. Covers coding guidelines, security controls, and code review requirements.",
    tags: ["Secure Coding", "Development", "Code Review", "Security Controls"],
    source: "NCA Toolkit"
  },
  {
    id: 112,
    name: "Web Applications Protection Standard",
    filename: "Standard_Web_Applications_Protection_Template_en-.pdf",
    category: "APPLICATION",
    description: "Standard for web application security. Covers WAF configuration, OWASP controls, and application testing.",
    tags: ["Web Security", "WAF", "OWASP", "Application Security"],
    source: "NCA Toolkit"
  },
  {
    id: 113,
    name: "Wireless Network Security Standard",
    filename: "Standard_Wireless_Network_Security_Template_en-.pdf",
    category: "NETWORK",
    description: "Standard for wireless network security. Covers Wi-Fi security, authentication, encryption, and monitoring.",
    tags: ["Wireless", "Wi-Fi Security", "Encryption", "Authentication"],
    source: "NCA Toolkit"
  },
  {
    id: 114,
    name: "Workstations Security Standard",
    filename: "Standard_Workstations_Security_Template_en-.pdf",
    category: "COMPUTE",
    description: "Standard for workstation security. Covers endpoint protection, hardening, access controls, and user configuration.",
    tags: ["Workstation", "Endpoint Security", "Hardening", "Access Control"],
    source: "NCA Toolkit"
  },
  {
    id: 115,
    name: "Vulnerability Register Template",
    filename: "REGISTER_Vulnerability-Register_Template_en_-.xlsx",
    category: "COMPUTE",
    description: "Excel template for tracking vulnerabilities. Covers vulnerability details, risk ratings, remediation status, and owners.",
    tags: ["Vulnerability", "Register", "Tracking", "Remediation"],
    source: "NCA Toolkit"
  },
  {
    id: 116,
    name: "Cybersecurity Audit Plan Register",
    filename: "Register_Cybersecurity-Audit-Plan_Template_en.xlsx",
    category: "GOVERNANCE",
    description: "Excel template for planning cybersecurity audits. Covers audit schedule, scope, resources, and deliverables.",
    tags: ["Audit", "Planning", "Register", "Schedule"],
    source: "NCA Toolkit"
  },
  {
    id: 117,
    name: "Cybersecurity Risk Management Register",
    filename: "Register_Cybersecurity-Risk-Management_template_en_v0.9-.xlsx",
    category: "GOVERNANCE",
    description: "Excel template for risk management. Covers risk identification, assessment, treatment plans, and monitoring.",
    tags: ["Risk Management", "Register", "Risk Assessment", "Tracking"],
    source: "NCA Toolkit"
  },
  {
    id: 118,
    name: "Cybersecurity Audit Report Template",
    filename: "Report_Cybersecurity-Audit_Template_en_-.pdf",
    category: "GOVERNANCE",
    description: "Template for cybersecurity audit reports. Covers findings, recommendations, and remediation tracking.",
    tags: ["Audit", "Report", "Findings", "Recommendations"],
    source: "NCA Toolkit"
  },
  {
    id: 119,
    name: "KPI Report Template",
    filename: "Report_Key-Performance-Indicator-Report_Template_en_.xlsx",
    category: "GOVERNANCE",
    description: "Excel template for cybersecurity KPI reporting. Covers metrics, dashboards, and performance tracking.",
    tags: ["KPI", "Metrics", "Report", "Performance"],
    source: "NCA Toolkit"
  }
];

export const categories = [
  { id: "all", name: "All Templates" },
  { id: "GOVERNANCE", name: "Governance"},
  { id: "IDENTIFY AND ACCESS", name: "Identity & Access" },
  { id: "COMPUTE", name: "Compute" },
  { id: "NETWORK", name: "Network" },
  { id: "APPLICATION", name: "Application" },
  { id: "RESILIENCE", name: "Resilience" }
];

export const sources = [
  { id: "all", name: "All Sources" },
  { id: "SANS", name: "SANS" },
  { id: "NCA Toolkit", name: "NCA Cybersecurity Toolkit" }
];
