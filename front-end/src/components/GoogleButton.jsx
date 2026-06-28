import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
// Treat the placeholder value as "not configured".
const CONFIGURED = CLIENT_ID && !CLIENT_ID.startsWith("your_google_client_id");

export default function GoogleButton({ onError }) {
  const { loginWithGoogle } = useAuth();

  if (!CONFIGURED) {
    return (
      <div className="google-disabled" title="Set VITE_GOOGLE_CLIENT_ID to enable">
        <span className="g-icon">G</span>
        Google sign-in (add a Client ID to enable)
      </div>
    );
  }

  return (
    <div className="google-wrap">
      <GoogleLogin
        onSuccess={async (res) => {
          try {
            await loginWithGoogle(res.credential);
          } catch (err) {
            onError?.(err.message || "Google sign-in failed");
          }
        }}
        onError={() => onError?.("Google sign-in failed")}
        theme="outline"
        size="large"
        width="320"
      />
    </div>
  );
}
