import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layouts';
import { themeConfig } from '../config/theme';

export default function TermsOfService() {
  const { theme } = useTheme();

  return (
    <PageLayout>
      <div className={`mx-auto max-w-3xl text-base leading-7 ${
        theme === 'dark'
          ? `text-${themeConfig.colors.dark.text.secondary}`
          : `text-${themeConfig.colors.light.text.secondary}`
      }`}>
        <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
          theme === 'dark'
            ? `text-${themeConfig.colors.dark.text.primary}`
            : `text-${themeConfig.colors.light.text.primary}`
        }`}>Terms of Service</h1>
        <div className="mt-10 max-w-2xl">
          <h2 className={`mt-8 text-2xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>1. Agreement to Terms</h2>
          <p className="mt-6">
            By accessing and using neurocode.academy and our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">2. Course Access</h2>
          <p className="mt-6">
            Upon successful payment, you will receive access to the purchased course materials for the duration specified in your purchase. Course materials are for personal use only and may not be shared or redistributed.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">3. Refund Policy</h2>
          <p className="mt-6">
            We offer a 14-day money-back guarantee on all courses. If you're not satisfied with your purchase, contact us within 14 days of purchase for a full refund.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">4. Intellectual Property</h2>
          <p className="mt-6">
            All course materials, including videos, documents, and code examples, are the intellectual property of NeuroCode Academy and are protected by copyright law.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">5. User Conduct</h2>
          <p className="mt-6">
            Users agree to maintain professional and respectful behavior in all interactions within the course platform and community spaces.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">6. Modifications</h2>
          <p className="mt-6">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes via email.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">7. Contact</h2>
          <p className="mt-6">
            For questions about these terms, please contact us at support@neurocode.academy
          </p>
        </div>
      </div>
    </PageLayout>
  );
}