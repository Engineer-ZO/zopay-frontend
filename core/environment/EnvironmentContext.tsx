"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUserMerchantData } from '@/features/merchants/context/MerchantContext';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Cloud,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  RefreshCw,
  Server,
  Database,
  Zap,
  Globe,
  Lock,
  Unlock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export type Environment = 'sandbox' | 'production';

interface EnvironmentContextType {
  environment: Environment;
  isSwitching: boolean;
  hasProductionAccess: boolean;
  switchEnvironment: (newEnvironment: Environment) => Promise<void>;
  requestEnvironmentSwitch: (newEnvironment: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

const ENVIRONMENT_STORAGE_KEY = 'zopay_environment';

// Environment Badge Component
const EnvironmentBadge = ({ environment, size = 'md' }: { environment: Environment; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-semibold ${sizes[size]} ${
      environment === 'production'
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
    }`}>
      {environment === 'production' ? (
        <Shield className="w-3.5 h-3.5" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      {environment === 'production' ? 'Production' : 'Sandbox'}
    </span>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  type = 'warning',
  confirmText,
  cancelText = 'Cancel',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  details?: string;
  type?: 'warning' | 'info' | 'success';
  confirmText: string;
  cancelText?: string;
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 dark:bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    },
    info: {
      icon: Info,
      iconBg: 'bg-sky-100 dark:bg-sky-500/10',
      iconColor: 'text-sky-600 dark:text-sky-400',
      buttonBg: 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    },
  };

  const Icon = typeStyles[type].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Gradient Header */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          type === 'warning' ? 'from-amber-500 to-orange-500' :
          type === 'info' ? 'from-sky-500 to-blue-500' :
          'from-emerald-500 to-teal-500'
        }`} />
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${typeStyles[type].iconBg}`}>
              <Icon className={`w-5 h-5 ${typeStyles[type].iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {message}
              </p>
              {details && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">{details}</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all ${typeStyles[type].buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  );
};

/**
 * Environment Provider Component
 * Manages environment state (sandbox/production) globally across the app
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const { merchant, isLoading: isMerchantLoading } = useUserMerchantData();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const hasProductionAccess = merchant?.productionState === 'ACTIVE';
  
  const getDefaultEnvironment = useCallback((): Environment => {
    if (typeof window === 'undefined') return 'sandbox';
    
    const saved = localStorage.getItem(ENVIRONMENT_STORAGE_KEY) as Environment | null;
    if (saved === 'production' || saved === 'sandbox') {
      if (saved === 'production' && !hasProductionAccess) {
        return 'sandbox';
      }
      return saved;
    }
    
    return hasProductionAccess ? 'production' : 'sandbox';
  }, [hasProductionAccess]);

  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<Environment | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize environment once when merchant data loads
  useEffect(() => {
    try {
      if (!isMerchantLoading && merchant && !hasInitialized) {
        let saved: Environment | null = null;
        
        try {
          if (typeof window !== 'undefined') {
            saved = localStorage.getItem(ENVIRONMENT_STORAGE_KEY) as Environment | null;
          }
        } catch (error) {
          console.warn('[Environment] Failed to read from localStorage:', error);
        }
        
        if (saved === 'production' || saved === 'sandbox') {
          if (saved === 'production' && !hasProductionAccess) {
            console.log('[Environment] Saved production preference but no access, defaulting to sandbox');
            setEnvironment('sandbox');
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(ENVIRONMENT_STORAGE_KEY, 'sandbox');
              }
            } catch (error) {
              console.warn('[Environment] Failed to write to localStorage:', error);
            }
          } else {
            console.log('[Environment] Using saved preference:', saved);
            setEnvironment(saved);
          }
        } else {
          const defaultEnv = 'sandbox';
          console.log('[Environment] No saved preference, defaulting to:', defaultEnv);
          setEnvironment(defaultEnv);
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(ENVIRONMENT_STORAGE_KEY, defaultEnv);
            }
          } catch (error) {
            console.warn('[Environment] Failed to write to localStorage:', error);
          }
        }
        
        setHasInitialized(true);
      }
    } catch (error) {
      console.error('[Environment] Error during initialization:', error);
      setEnvironment('sandbox');
      setHasInitialized(true);
    }
  }, [isMerchantLoading, merchant, hasProductionAccess, hasInitialized]);

  const requestEnvironmentSwitch = useCallback((newEnvironment: Environment) => {
    if (newEnvironment === 'production' && !hasProductionAccess) {
      throw new Error('Production access is not available. Please contact support to activate production access.');
    }

    if (newEnvironment === environment) {
      return;
    }

    setPendingSwitch(newEnvironment);
  }, [environment, hasProductionAccess]);

  const switchEnvironment = useCallback(async (newEnvironment: Environment) => {
    if (newEnvironment === 'production' && !hasProductionAccess) {
      throw new Error('Production access is not available.');
    }

    if (newEnvironment === environment) {
      return;
    }

    setIsSwitching(true);
    setPendingSwitch(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ENVIRONMENT_STORAGE_KEY, newEnvironment);
      }

      await queryClient.clear();
      setEnvironment(newEnvironment);
      await queryClient.invalidateQueries();
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching environment:', error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [environment, hasProductionAccess, queryClient, router]);

  const currentEnvironment: Environment = environment || 'sandbox';

  const value: EnvironmentContextType = {
    environment: currentEnvironment,
    isSwitching,
    hasProductionAccess,
    switchEnvironment,
    requestEnvironmentSwitch,
  };

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[Environment Context] Current environment:', currentEnvironment);
      console.log('[Environment Context] Has production access:', hasProductionAccess);
      console.log('[Environment Context] Initialized:', hasInitialized);
      console.log('[Environment Context] Merchant ID:', merchant?.id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  }, [currentEnvironment, hasProductionAccess, hasInitialized, merchant?.id]);

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
      
      {/* Environment Switch Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!pendingSwitch}
        onClose={() => setPendingSwitch(null)}
        onConfirm={() => pendingSwitch && switchEnvironment(pendingSwitch)}
        title={`Switch to ${pendingSwitch === 'production' ? 'Production' : 'Sandbox'} Environment?`}
        message={`You are about to switch from ${currentEnvironment} to ${pendingSwitch}.`}
        details={pendingSwitch === 'production' 
          ? "⚠️ You are switching to the live production environment. All transactions will process real money. Please ensure you have proper testing before proceeding."
          : "ℹ️ You are switching to the test sandbox environment. All transactions will be simulated. Great for testing and development!"}
        type={pendingSwitch === 'production' ? 'warning' : 'info'}
        confirmText={`Switch to ${pendingSwitch === 'production' ? 'Production' : 'Sandbox'}`}
        cancelText="Cancel"
      />
      
      {/* Switching Loader Modal */}
      {isSwitching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative max-w-sm w-full mx-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
              {/* Animated gradient orb */}
              <div className="relative mb-6 flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full opacity-20 animate-ping ${
                    environment === 'production' ? 'bg-indigo-500' : 'bg-amber-500'
                  }`} />
                </div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Switching to {environment === 'production' ? 'Production' : 'Sandbox'}...
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading your dashboard data
              </p>
              
              {/* Progress bar */}
              <div className="mt-6 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full animate-progress-bar bg-gradient-to-r ${
                  environment === 'production' 
                    ? 'from-indigo-500 to-purple-600'
                    : 'from-amber-500 to-orange-500'
                }`} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes progress-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </EnvironmentContext.Provider>
  );
}

/**
 * Hook to access environment context
 * Must be used within EnvironmentProvider
 */
export function useEnvironment(): EnvironmentContextType {
  const context = useContext(EnvironmentContext);

  if (context === undefined) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }

  return context;
}

// Optional: Export EnvironmentBadge for use in other components
export { EnvironmentBadge };