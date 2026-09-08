import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Brand logo, tagline, categorized navigation links, and copyright statement.
 */
export default function Footer() {
  const linkGroups = [
    {
      title: 'Product',
      links: [
        { label: 'Real-time Scoring', href: '#features' },
        { label: 'Fraud Alerts', href: '#features' },
        { label: 'Analytics Engine', href: '#features' },
        { label: 'Role Permissions', href: '#features' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Security & Trust', href: '#security' },
        { label: 'Careers', href: '#careers' },
        { label: 'Press Kit', href: '#press' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Compliance (SOC 2)', href: '#compliance' },
        { label: 'Cookie Settings', href: '#cookies' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'Sales Inquiries', href: '#contact' },
        { label: 'Technical Support', href: '#support' },
        { label: 'Documentation', href: '#docs' },
        { label: 'Status Page', href: '#status' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0B0E14] border-t border-[#222734] pt-14 pb-10 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-[#222734]">
          {/* Brand Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white"
            >
              <span>FraudSentinel</span>
              <span className="text-xl" role="img" aria-label="Shield">🛡️</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Intelligent, low-latency transaction monitoring and ML fraud scoring platform designed for modern fintechs and digital commerce.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#161A22] border border-[#222734] text-xs font-mono text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                PCI-DSS Level 1 Certified
              </span>
            </div>
          </div>

          {/* Nav Categories */}
          {linkGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2 list-none p-0 m-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-xs"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright & Disclaimer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FraudSentinel Technologies Inc. All rights reserved.</p>
          <p className="text-gray-500">
            Frontend demonstration prototype • Non-production environment
          </p>
        </div>

      </div>
    </footer>
  );
}
