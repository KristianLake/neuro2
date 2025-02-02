import { Navigate } from 'react-router-dom';
import ComingSoon from './ComingSoon';

interface BetaRouteProps {
  children: React.ReactNode;
}

export default function BetaRoute({ children }: BetaRouteProps) {
  const hasBetaAccess = sessionStorage.getItem('betaAccess') === 'true';

  if (!hasBetaAccess) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}