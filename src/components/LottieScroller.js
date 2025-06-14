import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';
import { marked } from 'marked';
import Lottie from 'lottie-react';

// Example steps data - replace with your own content
const defaultSteps = [
  {
    Text: "# Welcome to Our Story\n\nThis animation will guide you through our journey of innovation and discovery.",
    Seconds: 0
  },
  {
    Text: "## The Beginning\n\nIt all started with a simple idea that would change everything we knew about the industry.",
    Seconds: 1.2
  },
  {
    Text: "### Our Mission\n\n- **Innovation** at every step\n- **Quality** in every detail\n- **Excellence** in every outcome",
    Seconds: 2
  },
  {
    Text: "## Breaking New Ground\n\nWe challenged conventional thinking and pushed boundaries that others thought were impossible to cross.",
    Seconds: 2.3
  },
  {
    Text: "### Key Achievements\n\n1. Revolutionary breakthrough in 2023\n2. Industry recognition and awards\n3. Global expansion across 50+ countries",
    Seconds: 2.9
  },
  {
    Text: "## The Future is Now\n\n*Together, we're building tomorrow's solutions today.*\n\nJoin us on this incredible journey.",
    Seconds: 3.4
  }
];

const LottieScroller = ({
  steps = defaultSteps,
  animationData = null, // Lottie JSON data
  directory = '',
  playbackConst: initialPlaybackConst = 50,
  widthRatio: initialWidthRatio = 1.78,
  fullFrame = false,
  includeSmall = true,
  smallWidthRatio = 0.5625,
  largeWidthRatio = 1.78,
  ariaDescription = '',
  onComplete, // New prop for custom completion callback
  onScrollComplete // New prop for scroll-based completion
}) => {
  const logMessages = true;
  
  // State
  const [ua, setUa] = useState('');
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasCompletedScroll, setHasCompletedScroll] = useState(false);
  const [playbackConst, setPlaybackConst] = useState(initialPlaybackConst);
  const [widthRatio, setWidthRatio] = useState(initialWidthRatio);
  const [ready, setReady] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [scrollTriggerHeight, setScrollTriggerHeight] = useState(0);
  
  // Refs
  const scrollerRef = useRef(null);
  const containerRef = useRef(null);
  const lottieRef = useRef(null);
  
  // Animation properties
  const [duration, setDuration] = useState(300); // Default duration
  const [totalFrames, setTotalFrames] = useState(300);

  const log = (msg) => {
    if (logMessages) {
      console.log(msg);
    }
  };

  const constrain = (n, low, high) => {
    return Math.max(Math.min(n, high), low);
  };

  const setSizes = useCallback(() => {
    let newWidthRatio = widthRatio;
    if (includeSmall && smallWidthRatio) {
      newWidthRatio = innerWidth < 600 ? smallWidthRatio : largeWidthRatio;
      setWidthRatio(newWidthRatio);
    }

    let newHeight, newWidth;
    
    if (!fullFrame) {
      newHeight = innerHeight > innerWidth / newWidthRatio ? 
        innerWidth / newWidthRatio : innerHeight;
      newWidth = innerHeight > innerWidth / newWidthRatio ? 
        innerWidth : innerHeight * newWidthRatio;
    } else {
      newHeight = innerHeight;
      newWidth = innerWidth;
    }

    setWidth(newWidth);
    setHeight(newHeight);
  }, [widthRatio, innerWidth, innerHeight, fullFrame, includeSmall, smallWidthRatio, largeWidthRatio]);

  // Enhanced completion handler
  const handleAnimationComplete = useCallback(() => {
    console.log('Lottie animation naturally completed!');
    setIsAnimationComplete(true);
    
    // Keep animation on last frame
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(totalFrames - 1, true);
    }
    
    // Call custom onComplete callback if provided
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  }, [onComplete, totalFrames]);

  // Enhanced scroll completion handler
  const handleScrollComplete = useCallback(() => {
    console.log('Scroll-based animation completion triggered!');
    
    if (!hasCompletedScroll) {
      setHasCompletedScroll(true);
      
      // Keep animation on last frame
      if (lottieRef.current) {
        lottieRef.current.goToAndStop(totalFrames - 1, true);
      }
      
      // Calculate the actual height needed based on the last step's position
      const lastStepPosition = getPosition(steps.length - 1, steps[steps.length - 1].Seconds, duration, 30, playbackConst);
      const finalHeight = lastStepPosition + window.innerHeight; // Add one viewport height for smooth transition
      setScrollTriggerHeight(finalHeight);
      
      // Call custom scroll completion callback if provided
      if (onScrollComplete && typeof onScrollComplete === 'function') {
        onScrollComplete();
      }
    }
  }, [hasCompletedScroll, onScrollComplete, totalFrames, steps, duration, playbackConst]);

  const scrollAnimate = useCallback(() => {
    if (!totalFrames || !lottieRef.current) return;
    
    const p = progress > 0 ? constrain(progress, 0, 1) : 0;
    const targetFrame = Math.floor(p * (totalFrames - 1));
    
    setCurrentFrame(targetFrame);
    
    // Control Lottie playback using the ref
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(targetFrame, true);
    }

    // Trigger scroll completion when we reach the end, but keep animation visible
    if (p >= 1) {
      handleScrollComplete();
    }
  }, [progress, totalFrames, handleScrollComplete]);

  const updateCanvasPosition = useCallback(() => {
    // Not needed anymore since animation is always fixed
  }, []);

  const handleScroll = useCallback(() => {
    // Not needed anymore since animation is always fixed
  }, []);

  const handleResize = useCallback(
    debounce(() => {
      const userAgent = window.navigator.userAgent;
      const iOS = !!userAgent.match(/iPad/i) || !!userAgent.match(/iPhone/i);
      
      if (iOS) return;

      console.log('resize! Lottie');

      const newPlaybackConst = window.innerWidth < 600 && includeSmall ? 20 : 50;
      setPlaybackConst(newPlaybackConst);

      setSizes();

      if (hasCompletedScroll) {
        updateCanvasPosition();
      }
    }, 250),
    [includeSmall, hasCompletedScroll, updateCanvasPosition, setSizes]
  );

  const getPosition = (index, seconds, duration, frameRate, playbackConst) => {
    let height = index === 0 ? 
      ((index + 0.5) * (duration * playbackConst)) / steps.length / 2 :
      ((index + 0.5) * (duration * playbackConst)) / steps.length;
    
    if (!isNaN(parseFloat(seconds))) {
      height = parseFloat(seconds) * 30 * playbackConst; // Using 30 as default frameRate
    }
    return height;
  };

  // Handle when Lottie data is loaded
  const handleLottieDataReady = useCallback((animationItem) => {
    console.log('Lottie data ready!');
    if (animationItem) {
      setTotalFrames(animationItem.totalFrames || 300);
      setDuration(animationItem.totalFrames || 300);
      
      // Start at frame 0
      animationItem.goToAndStop(0, true);
    }
  }, []);

  // Initialize scroll trigger height
  useEffect(() => {
    if (ready) {
      const fullHeight = duration * playbackConst;
      const minHeight = window.innerHeight * 3; // Minimum 3 viewport heights for proper scrolling
      setScrollTriggerHeight(Math.max(fullHeight, minHeight));
    }
  }, [ready, duration, playbackConst]);

  // Scroll progress calculation
  useEffect(() => {
    const handleScrollProgress = () => {
      if (!scrollerRef.current) return;
      
      const scrollTrigger = scrollerRef.current.querySelector('.scroll-trigger');
      if (!scrollTrigger) return;
      
      const triggerRect = scrollTrigger.getBoundingClientRect();
      const triggerTop = triggerRect.top + window.scrollY;
      const triggerHeight = triggerRect.height;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate progress based on scroll trigger element
      const startScroll = triggerTop - viewportHeight;
      const endScroll = triggerTop + triggerHeight;
      const scrollRange = endScroll - startScroll;
      
      const scrollProgress = Math.max(0, Math.min(1, (scrollY - startScroll) / scrollRange));
      
      setProgress(scrollProgress);
      
      // Once animation completes, keep it completed regardless of scroll position
      if (scrollProgress >= 1 && !hasCompletedScroll) {
        setHasCompletedScroll(true);
      }
      
      // Don't reset completion state - keep animation visible
      // Removed the reset logic that was hiding the animation
    };

    window.addEventListener('scroll', handleScrollProgress);
    handleScrollProgress(); // Calculate initial progress
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, [ready, hasCompletedScroll]);

  // Initialize component
  useEffect(() => {
    log('func: onMount');
    setUa(window.navigator.userAgent);
    setInnerWidth(window.innerWidth);
    setInnerHeight(window.innerHeight);
    
    const newPlaybackConst = window.innerWidth < 600 && includeSmall ? 20 : 50;
    setPlaybackConst(newPlaybackConst);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleResize, includeSmall]);

  // Initialize sizes
  useEffect(() => {
    if (innerWidth && innerHeight) {
      setSizes();
      setReady(true);
    }
  }, [innerWidth, innerHeight, setSizes]);

  // Handle scroll animation
  useEffect(() => {
    if (ready && progress >= 0) {
      scrollAnimate();
    }
  }, [ready, progress, scrollAnimate]);

  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return (
    <div className="lottie-wrapper" ref={scrollerRef}>
      <div id="visually-hidden" style={{ position: 'absolute', left: '-9999px' }}>
        {ariaDescription}
      </div>
      
      <div className="lottie-container" aria-hidden="true">
        <div 
          ref={containerRef}
          className={`lottie-animation-container ${hasCompletedScroll ? 'completed' : ''}`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {animationData && (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              style={{ width: width, height: height }}
              onComplete={handleAnimationComplete}
              onDataReady={handleLottieDataReady}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid slice'
              }}
            />
          )}
          
          {!animationData && (
            <div 
              className="demo-placeholder"
              style={{ 
                width: `${width}px`, 
                height: `${height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                fontSize: '18px',
                color: '#666'
              }}
            >
              Lottie Animation Placeholder
              <br />
              <small>Pass animationData prop to display animation</small>
            </div>
          )}
        </div>

        {ready && (
          <div 
            className="scroll-trigger" 
            style={{ 
              height: `${scrollTriggerHeight}px`,
              transition: hasCompletedScroll ? 'height 0.8s ease-out' : 'none'
            }}
          >
            {steps.map((step, index) => (
              <section
                key={index}
                className="blurb"
                style={{
                  top: `${getPosition(index, step.Seconds, duration, 30, playbackConst)}px`
                }}
                dangerouslySetInnerHTML={{ __html: marked(step.Text || '') }}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .lottie-wrapper {
          position: relative;
          margin-left: 0px;
          margin-bottom: 0px;
          min-height: 100vh;
        }

        .lottie-container {
          position: relative;
          min-height: 100vh;
        }

        .lottie-animation-container {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          transition: opacity 0.3s ease-out;
        }

        /* Keep the animation visible and fade it out only when far past completion */
        .lottie-animation-container.completed {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          opacity: 1;
        }

        .demo-placeholder {
          border: 2px dashed #ccc;
          border-radius: 8px;
          text-align: center;
        }

        .scroll-trigger {
          position: relative;
          width: 100%;
          min-height: 100vh;
          z-index: 10;
        }

        .blurb {
          max-width: 660px;
          margin-top: -10vh;
          width: 100%;
          padding: 40px;
          text-align: left;
          position: absolute;
          left: 50%;
          transform: translate(-50%, 0%);
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        @media (max-width: 930px) {
          .blurb {
            margin-top: 50px;
          }
        }

        .blurb :global(p) {
          font-size: 1.5rem;
          -webkit-font-smoothing: antialiased;
        }

        .blurb :global(h1) {
          color: #333;
          margin-bottom: 1rem;
        }

        .blurb :global(h2) {
          color: #555;
          margin-bottom: 0.8rem;
        }

        .blurb :global(h3) {
          color: #666;
          margin-bottom: 0.6rem;
        }

        .blurb :global(ul) {
          margin: 1rem 0;
        }

        .blurb :global(li) {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default LottieScroller;