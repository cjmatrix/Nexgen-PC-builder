import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            color: "#343a40",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Something went wrong.
          </h1>
          <p style={{ marginBottom: "1.5rem" }}>
            We apologize for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
