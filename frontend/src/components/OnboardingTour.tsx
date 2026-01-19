import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import './OnboardingTour.css';

interface OnboardingTourProps {
  steps: Step[];
  run: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  spotlightClicks?: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  run,
  onComplete,
  onSkip,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
  spotlightClicks = true,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (run) {
      // Reset to step 0 when tour starts
      setStepIndex(0);
      
      // Validate that the FIRST step target exists (critical for starting at step 1)
      const validateFirstStep = () => {
        if (steps.length === 0) {
          console.warn('No steps defined for tour');
          return false;
        }

        const firstStep = steps[0];
        if (firstStep.target) {
          const element = document.querySelector(firstStep.target as string);
          if (!element) {
            console.error(`FIRST STEP TARGET NOT FOUND: ${firstStep.target}`);
            console.error('Tour cannot start without first step target. Retrying...');
            return false;
          } else {
            console.log(`✅ FIRST STEP TARGET FOUND: ${firstStep.target}`);
            // Scroll to element to ensure it's visible
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
          }
        }
        // If no target, it's valid (floating step)
        return true;
      };

      // Validate all targets for logging
      const validateAllTargets = () => {
        steps.forEach((step, index) => {
          if (step.target) {
            const element = document.querySelector(step.target as string);
            if (!element) {
              console.warn(`⚠️ Step ${index + 1} target not found: ${step.target}`);
            } else {
              console.log(`✅ Step ${index + 1} target found: ${step.target}`);
            }
          }
        });
      };

      // Try to validate first step immediately
      if (validateFirstStep()) {
        validateAllTargets();
        console.log('🚀 Starting tour from STEP 1');
        setIsRunning(true);
      } else {
        // Retry after a short delay
        const retryTimer = setTimeout(() => {
          if (validateFirstStep()) {
            validateAllTargets();
            console.log('🚀 Starting tour from STEP 1 (after retry)');
            setIsRunning(true);
          } else {
            // Final retry
            setTimeout(() => {
              if (validateFirstStep()) {
                validateAllTargets();
                console.log('🚀 Starting tour from STEP 1 (final retry)');
                setIsRunning(true);
              } else {
                console.error('❌ Failed to find first step target after multiple retries');
                // Start anyway - react-joyride will handle missing targets
                setIsRunning(true);
              }
            }, 1000);
          }
        }, 500);
        return () => clearTimeout(retryTimer);
      }
    } else {
      setIsRunning(false);
      setStepIndex(0);
    }
  }, [run, steps]);

  // Force grey overlay background when tour is running
  useEffect(() => {
    if (isRunning) {
      const style = document.createElement('style');
      style.id = 'joyride-overlay-grey';
      style.textContent = `
        [class*="react-joyride__overlay"],
        [class*="joyride-overlay"],
        div[style*="position: fixed"][style*="z-index"]:not([class*="tooltip"]) {
          background-color: rgba(100, 100, 100, 0.4) !important;
        }
        /* Ensure spotlight/highlighted elements are visible and clickable */
        [class*="react-joyride__spotlight"],
        [class*="joyride-spotlight"] {
          mix-blend-mode: normal !important;
          background-color: transparent !important;
          pointer-events: auto !important;
        }
        /* Allow clicks on target elements */
        [data-tour="city-selector"],
        [data-tour="city-selector"] * {
          pointer-events: auto !important;
          z-index: 10001 !important;
          position: relative !important;
        }
        /* Ensure the button and its parent container are clickable */
        button[data-tour="city-selector"],
        .flex.items-center.gap-1 button[data-tour="city-selector"],
        .flex.items-center.gap-2 button[data-tour="city-selector"] {
          pointer-events: auto !important;
          z-index: 10002 !important;
          position: relative !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById('joyride-overlay-grey');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isRunning]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action, index, step } = data;

    // Update step index
    setStepIndex(index);

    // Log for debugging
    console.log(`📍 Tour callback - Step ${index + 1}/${steps.length}:`, { 
      status, 
      type, 
      action, 
      step: step?.target 
    });

    // Handle step navigation - especially important for back navigation
    if (type === 'step:before' && step?.target) {
      const targetElement = document.querySelector(step.target as string);
      if (!targetElement) {
        console.error(`❌ Tour step ${index + 1} target not found: ${step.target}`);
        // If first step is missing, log critical error
        if (index === 0) {
          console.error('🚨 CRITICAL: First step target is missing! Tour may skip step 1.');
          // Try to find it again with multiple retries
          let retryCount = 0;
          const maxRetries = 5;
          const findElement = () => {
            const retryElement = document.querySelector(step.target as string);
            if (retryElement) {
              console.log('✅ Found city-selector on retry, scrolling into view');
              retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              window.dispatchEvent(new Event('resize'));
            } else if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(findElement, 200);
            }
          };
          setTimeout(findElement, 200);
        }
      } else {
        console.log(`✅ Tour step ${index + 1} target found: ${step.target}, scrolling into view`);
        // Ensure element is visible and scroll into view
        // Use longer timeout for back navigation to ensure smooth transition
        const scrollDelay = action === 'prev' ? 300 : 100;
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Force a re-render of the spotlight by triggering a resize event
          window.dispatchEvent(new Event('resize'));
        }, scrollDelay);
      }
    }

    // Prevent auto-advance - only allow manual navigation
    if (type === 'step:after' && action !== 'next' && action !== 'prev' && action !== 'skip') {
      // Don't auto-advance - wait for user to click Next
      return;
    }

    // Handle back button - ensure it goes to previous step and highlights correctly
    if (action === 'prev') {
      const previousStepIndex = index - 1;
      console.log(`⬅️ Back button clicked, going from step ${index + 1} to step ${previousStepIndex + 1}`);
      // When going back to step 1 (index 0), ensure city-selector is visible
      if (previousStepIndex === 0 && steps[0]?.target) {
        setTimeout(() => {
          const citySelector = document.querySelector(steps[0].target as string);
          if (citySelector) {
            console.log('✅ Navigating back to step 1 - scrolling to city-selector');
            citySelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Force spotlight update to ensure highlighting works
            window.dispatchEvent(new Event('resize'));
          } else {
            console.error('❌ city-selector not found when navigating back to step 1');
          }
        }, 100);
      }
      return;
    }

    // Handle next button
    if (action === 'next' || action === 'update') {
      console.log(`➡️ Next button clicked, going from step ${index + 1} to step ${index + 2}`);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setIsRunning(false);
      setStepIndex(0);
      if (status === STATUS.FINISHED && onComplete) {
        onComplete();
      }
      if (status === STATUS.SKIPPED && onSkip) {
        onSkip();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      disableOverlayClose={false}
      disableScrolling={false}
      hideCloseButton={false}
      spotlightClicks={spotlightClicks}
      scrollToFirstStep={true}
      scrollOffset={20}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563EB', // Blue color
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: 'rgba(100, 100, 100, 0.4)', // Lighter grey overlay - partially visible background
          mixBlendMode: 'normal',
        },
        overlayLegacy: {
          backgroundColor: 'rgba(100, 100, 100, 0.7)',
        },
        spotlight: {
          borderRadius: 8,
          mixBlendMode: 'normal',
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
          backgroundColor: 'rgba(249, 250, 251, 0.98)', // Light grey with slight transparency
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(229, 231, 235, 0.8)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: '#111827',
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '8px',
        },
        tooltipContent: {
          color: '#4B5563',
          fontSize: '14px',
          lineHeight: '1.6',
        },
        buttonNext: {
          backgroundColor: '#2563EB',
          color: '#fff',
          borderRadius: 10,
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
        },
        buttonBack: {
          color: '#6B7280',
          marginRight: 10,
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: '#6B7280',
          fontSize: '14px',
          fontWeight: 500,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip',
      }}
    />
  );
};

export default OnboardingTour;

