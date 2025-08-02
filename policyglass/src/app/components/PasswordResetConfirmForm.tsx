import { useState } from 'react';

interface PasswordResetConfirmFormProps {
  token: string;
  onResetSuccess: () => void;
}

export default function PasswordResetConfirmForm({ token, onResetSuccess }: PasswordResetConfirmFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        onResetSuccess();
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-confirm-form">
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new-password">New Password:</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirm New Password:</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">Password reset successful!</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
