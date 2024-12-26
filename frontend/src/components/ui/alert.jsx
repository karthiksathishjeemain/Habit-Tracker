// import React from 'react';
import PropTypes from 'prop-types';

export const Alert = ({ children, variant = "default" }) => {
  return (
    <div className={`p-4 rounded-lg ${
      variant === "destructive" ? "bg-red-100 text-red-700" : "bg-gray-100"
    }`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};

// Add PropTypes validation
Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'destructive'])
};

AlertDescription.propTypes = {
  children: PropTypes.node.isRequired
};

// Add default props (optional)
Alert.defaultProps = {
  variant: 'default'
};