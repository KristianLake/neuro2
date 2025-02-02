import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layouts';
import { themeConfig } from '../config/theme';

export default function PrivacyPolicy() {
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
        }`}>Privacy Policy</h1>
        <div className="mt-10 max-w-2xl">
          <h2 className={`mt-8 text-2xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>1. Information We Collect</h2>
          <p className="mt-6">
            We collect information you provide directly to us, including name, email address, and payment information when you register for our courses.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">2. How We Use Your Information</h2>
          <p className="mt-6">
            We use the information we collect to:
          </p>
          <ul className="mt-4 list-disc pl-8">
            <li>Provide and maintain our services</li>
            <li>Process your payments</li>
            <li>Send you course updates and support communications</li>
            <li>Improve our services</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">3. Data Security</h2>
          <p className="mt-6">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">4. Cookies</h2>
          <p className="mt-6">
            We use cookies to enhance your experience on our website. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">5. Third-Party Services</h2>
          <p className="mt-6">
            We use trusted third-party services for payment processing and course delivery. These services have their own privacy policies.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">6. Your Rights</h2>
          <p className="mt-6">
            You have the right to:
          </p>
          <ul className="mt-4 list-disc pl-8">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">7. Updates to This Policy</h2>
          <p className="mt-6">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">8. Contact Us</h2>
          <p className="mt-6">
            For questions about this privacy policy, please contact us at privacy@neurocode.academy
          </p>
        </div>
      </div>
    </PageLayout>
  );
}