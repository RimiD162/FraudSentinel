import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * Footer Component
 * Brand logo, tagline, categorized navigation links, and copyright statement in White & Gold.
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
    <footer className="bg-[#FAF8F2] border-t border-[#EBE3D0] pt-10 pb-10 text-[#6B6454] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1A1612]"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Shield className="w-4 h-4 fill-white/20 text-white" />
              </div>
              <span className="font-extrabold tracking-tight">
                Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
              </span>
            </Link>
            <p className="text-sm text-[#5C5648] max-w-sm leading-relaxed font-normal">
              Intelligent, low-latency transaction monitoring and ML fraud scoring platform designed for modern fintechs and digital commerce.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E5DCBE] text-xs font-mono text-[#4A4438] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                PCI-DSS Level 1 Certified
              </span>
              <Link
                to="/login/analyst"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-[#E5DCBE] hover:border-amber-400 text-xs font-semibold text-[#5C5648] hover:text-amber-900 transition-colors shadow-2xs"
                title="Fraud Analyst Portal"
              >
                <span>Analyst Portal →</span>
              </Link>
              <Link
                to="/login/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-900 transition-colors shadow-2xs"
                title="System Administrator Console"
              >
                <span>Admin Portal →</span>
              </Link>
            </div>
          </div>



          {/* Nav Categories */}
          {linkGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs font-bold text-[#1A1612] uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2 list-none p-0 m-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[#6B6454] hover:text-amber-800 transition-colors text-xs font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
