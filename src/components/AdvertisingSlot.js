import PropTypes from 'prop-types';
import React, { useEffect, useRef, useContext } from 'react';
import AdvertisingContext from '../AdvertisingContext';
import calculateRootMargin from './utils/calculateRootMargin';
import isLazyLoading from './utils/isLazyLoading';
import getLazyLoadConfig from './utils/getLazyLoadConfig';

function AdvertisingSlot({
  id,
  style,
  className,
  children,
  customEventHandlers,
}) {
  const observerRef = useRef(null);
  const containerDivRef = useRef();
  const { activate, config } = useContext(AdvertisingContext);
  const lazyLoadConfig = getLazyLoadConfig(config, id);
  const isLazyLoadEnabled = isLazyLoading(lazyLoadConfig);
  useEffect(() => {
    if (!config || !isLazyLoadEnabled) {
      return () => {};
    }
    const rootMargin = calculateRootMargin(lazyLoadConfig);
    observerRef.current = new IntersectionObserver(
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          activate(id, customEventHandlers);
          if (containerDivRef.current) {
            observerRef.current.unobserve(containerDivRef.current);
          }
        }
      },
      { rootMargin }
    );
    observerRef.current.observe(containerDivRef.current);
    return () => {
      if (containerDivRef.current) {
        observerRef.current.unobserve(containerDivRef.current);
      }
    };
  }, [activate, config]);

  useEffect(() => {
    if (!config || isLazyLoadEnabled) {
      return;
    }
    activate(id, customEventHandlers);
  }, [activate, config]);
  return (
    <div
      id={id}
      style={style}
      className={className}
      children={children}
      ref={containerDivRef}
    />
  );
}

AdvertisingSlot.propTypes = {
  id: PropTypes.string.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
  customEventHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

AdvertisingSlot.defaultProps = {
  customEventHandlers: {},
};

export default AdvertisingSlot;
