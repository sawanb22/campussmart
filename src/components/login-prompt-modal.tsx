import { Link } from 'react-router-dom';
import { ArrowRight, Heart, X, type LucideIcon } from 'lucide-react';

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
  icon?: LucideIcon;
  eyebrow?: string;
  title?: string;
  description?: string;
}

const LoginPromptModal = ({
  open,
  onClose,
  icon: Icon = Heart,
  eyebrow = 'Quotation Wishlist',
  title = 'Login to save items to your quotation wishlist',
  description = 'Sign in to build your institutional wishlist, track quotation requests, and receive official pricing for your campus.',
}: LoginPromptModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login prompt"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-cm-blue px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cm-yellow text-cm-blue-dark">
            <Icon className="h-7 w-7" fill={Icon === Heart ? 'currentColor' : 'none'} />
          </div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cm-yellow">{eyebrow}</p>
          <h2 id="login-prompt-title" className="pr-8 text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-10 sm:py-7">
          <Link
            to="/login"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cm-blue px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-cm-blue-dark"
          >
            Login <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-lg border-2 border-cm-blue px-5 py-3 text-sm font-bold text-cm-blue transition-colors hover:bg-blue-50"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;