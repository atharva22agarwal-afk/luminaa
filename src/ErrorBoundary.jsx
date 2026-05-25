import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-report" style={{ padding: '20px', color: 'red', background: 'black', height: '100vh', width: '100vw' }}>
          <h1>Component Crashed</h1>
          <div id="error-message">{this.state.error && this.state.error.toString()}</div>
          <pre id="error-stack">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
