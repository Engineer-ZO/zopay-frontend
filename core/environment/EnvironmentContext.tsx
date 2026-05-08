"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUserMerchantData } from '@/features/merchants/context/MerchantContext';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export type Environment = 'sandbox' | 'production';

interface EnvironmentContextType {
  environment: Environment;
  isSwitching: boolean;
  hasProductionAccess: boolean;
  switchEnvironment: (newEnvironment: Environment) => Promise<void>;
  requestEnvironmentSwitch: (newEnvironment: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

const ENVIRONMENT_STORAGE_KEY = 'zitopay_environment';

/**
 * Environment Provider Component
 * Manages environment state (sandbox/production) globally across the app
 * Defaults to production if merchant has production access, otherwise sandbox
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const { merchant, isLoading: isMerchantLoading } = useUserMerchantData();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Check if merchant has production access
  const hasProductionAccess = merchant?.productionState === 'ACTIVE';
  
  // Initialize environment from localStorage or default based on production access
  const getDefaultEnvironment = useCallback((): Environment => {
    if (typeof window === 'undefined') return 'sandbox';
    
    const saved = localStorage.getItem(ENVIRONMENT_STORAGE_KEY) as Environment | null;
    if (saved === 'production' || saved === 'sandbox') {
      // Validate saved environment - can't use production without access
      if (saved === 'production' && !hasProductionAccess) {
        return 'sandbox';
      }
      return saved;
    }
    
    // Default: production if access available, otherwise sandbox
    return hasProductionAccess ? 'production' : 'sandbox';
  }, [hasProductionAccess]);

  const [environment, setEnvironment] = useState<Environment>(() => {
    // Initial state - check localStorage first, then default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ENVIRONMENT_STORAGE_KEY) as Environment | null;
      if (saved === 'production' || saved === 'sandbox') {
        return saved;
      }
    }
    return 'sandbox'; // Safe default until merchant data loads
  });

  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<Environment | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize environment once when merchant data loads (only on first load)
  useEffect(() => {
    try {
      if (!isMerchantLoading && merchant && !hasInitialized) {
        let saved: Environment | null = null;
        
        // Safely read from localStorage
        try {
          if (typeof window !== 'undefined') {
            saved = localStorage.getItem(ENVIRONMENT_STORAGE_KEY) as Environment | null;
          }
        } catch (error) {
          console.warn('[Environment] Failed to read from localStorage:', error);
        }
        
        // If there's a saved preference, validate it
        if (saved === 'production' || saved === 'sandbox') {
          // Validate saved environment - can't use production without access
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
            // Use saved preference
            console.log('[Environment] Using saved preference:', saved);
            setEnvironment(saved);
          }
        } else {
          // No saved preference - default to sandbox (safer for testing)
          // User can switch to production if they have access
          const defaultEnv = 'sandbox'; // Always default to sandbox first
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
      // Fallback to sandbox on error
      setEnvironment('sandbox');
      setHasInitialized(true);
    }
  }, [isMerchantLoading, merchant, hasProductionAccess, hasInitialized]);

  /**
   * Request environment switch - shows confirmation dialog
   */
  const requestEnvironmentSwitch = useCallback((newEnvironment: Environment) => {
    // Validate access
    if (newEnvironment === 'production' && !hasProductionAccess) {
      throw new Error('Production access is not available. Please contact support to activate production access.');
    }

    // If switching to same environment, do nothing
    if (newEnvironment === environment) {
      return;
    }

    // Set pending switch (will trigger confirmation modal)
    setPendingSwitch(newEnvironment);
  }, [environment, hasProductionAccess]);

  /**
   * Actually perform the environment switch
   * - Clears cache
   * - Updates state
   * - Prefetches dashboard data
   * - Redirects to dashboard
   */
  const switchEnvironment = useCallback(async (newEnvironment: Environment) => {
    // Validate access
    if (newEnvironment === 'production' && !hasProductionAccess) {
      throw new Error('Production access is not available.');
    }

    // If switching to same environment, do nothing
    if (newEnvironment === environment) {
      return;
    }

    setIsSwitching(true);
    setPendingSwitch(null);

    try {
      // Save to localStorage FIRST
      if (typeof window !== 'undefined') {
        localStorage.setItem(ENVIRONMENT_STORAGE_KEY, newEnvironment);
      }

      // Clear all cached queries BEFORE updating state
      // This ensures old environment data is removed
      await queryClient.clear();

      // Update environment state (this will trigger queries to refetch with new environment)
      setEnvironment(newEnvironment);

      // Invalidate all queries to force refetch with new environment
      // This ensures queries use the new environment value
      await queryClient.invalidateQueries();

      // Small delay to ensure state updates propagate and queries refetch
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching environment:', error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [environment, hasProductionAccess, merchant?.id, queryClient, router]);

  // Ensure environment is always defined (fallback to sandbox)
  const currentEnvironment: Environment = environment || 'sandbox';

  const value: EnvironmentContextType = {
    environment: currentEnvironment,
    isSwitching,
    hasProductionAccess,
    switchEnvironment,
    requestEnvironmentSwitch,
  };

  // Debug logging - ALWAYS log
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
      {/* Confirmation Modal */}
      {pendingSwitch && (
        <EnvironmentSwitchConfirmation
          currentEnvironment={environment}
          targetEnvironment={pendingSwitch}
          hasProductionAccess={hasProductionAccess}
          onConfirm={() => switchEnvironment(pendingSwitch)}
          onCancel={() => setPendingSwitch(null)}
        />
      )}
      {/* Switching Loader */}
      {isSwitching && <EnvironmentSwitchingLoader targetEnvironment={environment} />}
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

/**
 * Environment Switch Confirmation Modal
 */
interface EnvironmentSwitchConfirmationProps {
  currentEnvironment: Environment;
  targetEnvironment: Environment;
  hasProductionAccess: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function EnvironmentSwitchConfirmation({
  currentEnvironment,
  targetEnvironment,
  hasProductionAccess,
  onConfirm,
  onCancel,
}: EnvironmentSwitchConfirmationProps) {
  const isSwitchingToProduction = targetEnvironment === 'production';
  const isSwitchingToSandbox = targetEnvironment === 'sandbox';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Switch Environment?
          </h3>
          <p className="text-sm text-muted-foreground">
            You are about to switch from{' '}
            <span className="font-medium capitalize">{currentEnvironment}</span> to{' '}
            <span className="font-medium capitalize">{targetEnvironment}</span>.
          </p>
        </div>

        {isSwitchingToProduction && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="text-orange-600 dark:text-orange-400 mt-0.5">
                ⚠️
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Production Environment
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  You are switching to the live production environment. All transactions will process real money.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSwitchingToSandbox && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                ℹ️
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Sandbox Environment
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  You are switching to the test sandbox environment. All transactions will be simulated.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          The dashboard will reload with data from the {targetEnvironment} environment.
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isSwitchingToProduction
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Switch to {targetEnvironment === 'production' ? 'Production' : 'Sandbox'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Environment Switching Loader
 * Shows loading state while switching environments
 */
interface EnvironmentSwitchingLoaderProps {
  targetEnvironment: Environment;
}

function EnvironmentSwitchingLoader({ targetEnvironment }: EnvironmentSwitchingLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full ${
              targetEnvironment === 'production' 
                ? 'bg-orange-500' 
                : 'bg-blue-500'
            }`} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Switching to {targetEnvironment === 'production' ? 'Production' : 'Sandbox'}...
          </p>
          <p className="text-xs text-muted-foreground">
            Loading dashboard data
          </p>
        </div>
      </div>
    </div>
  );
}
