import { Redirect } from 'expo-router';
import Loading from '../src/components/Loading';
import { logout } from '../src/services/auth';
import { useAuth } from '../src/state/AuthProvider';
import { useDataStatus } from '../src/state/DataProvider';

// Porta de entrada: decide para onde ir conforme a sessão e o onboarding.
export default function Index() {
  const { session, ready } = useAuth();
  const { loaded, data, error, retry } = useDataStatus();

  if (!ready) return null;
  if (!session) return <Redirect href="/login" />;
  if (error) return <Loading error={error} onRetry={retry} onLogout={logout} />;
  if (!loaded || !data) return <Loading />;
  return <Redirect href={data.profile.onboardingCompleted ? '/(tabs)' : '/onboarding'} />;
}
