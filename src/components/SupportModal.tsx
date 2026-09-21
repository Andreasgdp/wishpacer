import React, { useState } from 'react';
import { Mail, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitted(true);
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Support"
      description="Get assistance or share product feedback"
    >
      <div className="flex flex-col space-y-4">
        <a
          href="mailto:support@savingplan.app?subject=Saving%20Plan%20Support%20Request"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between hover:border-sky-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Email Support Team
              </p>
              <p className="text-[11px] text-slate-500">support@savingplan.app</p>
            </div>
          </div>
          <Send className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
        </a>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-center space-y-1.5">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Feedback Received!
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Thank you for helping us improve Saving Plan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Label className="block">Send Direct Feedback</Label>
            <Textarea
              required
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Describe any issues, ideas, or feature requests..."
            />
            <Button type="submit" className="w-full gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </Button>
          </form>
        )}
      </div>
    </ResponsiveOverlay>
  );
};
