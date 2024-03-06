import React from 'react';

export const body = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow:'hidden'
  };
  

const Layout = ({ children }) => {
  return (
    <div style={body}>
      {children}
    </div>
  );
};

export default Layout;
