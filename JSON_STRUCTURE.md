# NCA ECC-2:2024 JSON Structure Documentation

## Overview
This JSON file contains a complete, structured representation of the Saudi Arabia National Cybersecurity Authority's Essential Cybersecurity Controls (ECC-2:2024) document, optimized for embedding and vector search applications.

## File Statistics
- **Total Size**: ~56 KB
- **Domains**: 4
- **Subdomains**: 28
- **Main Controls**: 108
- **Sub-controls**: 92
- **Terms & Definitions**: 62

## JSON Structure

### 1. Document Metadata
Contains core document information:
- Title, version, year
- Classification and TLP level
- Issuing authority details
- Previous version reference

### 2. Executive Summary
- High-level overview
- Key points about the framework
- Vision 2030 alignment

### 3. Scope and Applicability
- Target entities (government, CNI operators)
- Compliance requirements
- Legal mandates

### 4. Structure Information
- Overview statistics
- Domain/subdomain counts
- Control counts

### 5. Domains (4 Main Categories)

#### Domain 1: Cybersecurity Governance (10 Subdomains)
1. Cybersecurity Strategy
2. Cybersecurity Management
3. Cybersecurity Policies and Procedures
4. Cybersecurity Roles and Responsibilities
5. Cybersecurity Risk Management
6. Cybersecurity in IT Project Management
7. Compliance with Standards, Laws and Regulations
8. Periodical Cybersecurity Review and Audit
9. Cybersecurity in Human Resources
10. Cybersecurity Awareness and Training Program

#### Domain 2: Cybersecurity Defense (15 Subdomains)
1. Asset Management
2. Identity and Access Management
3. Information System and Processing Facilities Protection
4. Email Protection
5. Networks Security Management
6. Mobile Devices Security
7. Data and Information Protection
8. Cryptography
9. Backup and Recovery Management
10. Vulnerabilities Management
11. Penetration Testing
12. Cybersecurity Event Logs and Monitoring Management
13. Cybersecurity Incident and Threat Management
14. Physical Security
15. Web Application Security

#### Domain 3: Cybersecurity Resilience (1 Subdomain)
1. Cybersecurity Resilience Aspects of Business Continuity Management (BCM)

#### Domain 4: Third-Party and Cloud Computing Cybersecurity (2 Subdomains)
1. Third-Party Cybersecurity
2. Cloud Computing and Hosting Cybersecurity

### 6. Terms and Definitions
Comprehensive glossary of 62 cybersecurity terms with their official definitions.

### 7. Implementation Guidance
- General implementation notes
- Maturity level framework
- Periodic review recommendations
- Review triggers

### 8. References
- National frameworks
- International standards (ISO 27001, NIST, CIS)

### 9. Version History
- Current version details
- Previous versions
- Major changes documentation

## Data Structure for Each Control

```json
{
  "control_id": "X-Y-Z",
  "control_text": "Description of the control requirement",
  "subcontrols": [  // Optional, if applicable
    {
      "subcontrol_id": "X-Y-Z-N",
      "subcontrol_text": "Description of the sub-control"
    }
  ]
}
```

## Embedding Recommendations

### For Vector Embeddings:
1. **Chunk by Control**: Each control can be a separate embedding
2. **Include Context**: Prepend domain/subdomain names to control text
3. **Metadata Fields**: Use control_id, domain, subdomain as metadata

### Example Chunking Strategy:
```
Domain: Cybersecurity Governance
Subdomain: Cybersecurity Strategy
Control 1-1-1: The cybersecurity strategy of the entity shall be identified...
```

### Suggested Embedding Fields:
- **text**: Full control text with context
- **metadata**: 
  - domain_id, domain_name
  - subdomain_id, subdomain_name
  - control_id
  - has_subcontrols (boolean)
  - document_version

## Use Cases

1. **RAG Applications**: Retrieve relevant controls based on queries
2. **Compliance Checking**: Match organizational practices against controls
3. **Gap Analysis**: Identify missing controls in current implementations
4. **Training Materials**: Generate context-aware training content
5. **Audit Preparation**: Quick reference for specific control requirements

## Validation

The JSON structure has been validated for:
- ✅ Valid JSON syntax
- ✅ Complete hierarchical structure
- ✅ All 108 controls present
- ✅ All 92 sub-controls present
- ✅ Consistent ID formatting
- ✅ No missing or truncated content

## Notes

- All control IDs follow the pattern: `Domain-Subdomain-Control[-Subcontrol]`
- All text is in English as per the original document
- Periodic review requirements are included where specified
- The structure preserves the official NCA document hierarchy
