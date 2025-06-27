import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [keyword, setKeyword] = useState("");
  const [articles, setArticles] = useState([]);
  const [generatedPost, setGeneratedPost] = useState("");
  const [linkedinToken, setLinkedinToken] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [postingToLinkedIn, setPostingToLinkedIn] = useState(false);
  const [error, setError] = useState("");

  // 🔄 Capture token from URL when redirected from LinkedIn
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("linkedin_token");
    const authError = params.get("error");

    if (token) {
      setLinkedinToken(token);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
      setError(""); // Clear any previous errors
      console.log("LinkedIn token received successfully");
    } else if (authError) {
      setError(
        `LinkedIn authentication error: ${decodeURIComponent(authError)}`
      );
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const clearError = () => setError("");

  const fetchNews = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    try {
      setLoadingNews(true);
      setGeneratedPost(""); // clear previous post
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/news?keyword=${encodeURIComponent(keyword)}`
      );

      if (response.data.articles && response.data.articles.length > 0) {
        setArticles(response.data.articles);
      } else {
        setError(
          "No articles found for this keyword. Try a different search term."
        );
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(
        error.response?.data?.error || "Failed to fetch news. Please try again."
      );
      setArticles([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const generatePost = async () => {
    if (articles.length === 0) {
      setError("No articles available to generate post from");
      return;
    }

    try {
      setLoadingPost(true);
      setError("");

      const response = await axios.post(`${API_BASE_URL}/generate-post`, {
        articles: articles.map((a) => ({
          title: a.title,
          description: a.description,
        })),
      });

      setGeneratedPost(response.data.post);
    } catch (error) {
      console.error("Error generating post:", error);
      setError(
        error.response?.data?.error ||
          "Failed to generate post. Please try again."
      );
    } finally {
      setLoadingPost(false);
    }
  };

  const postToLinkedIn = async () => {
    if (!linkedinToken) {
      setError("Please connect to LinkedIn first");
      return;
    }
    if (!generatedPost) {
      setError("No post content to share");
      return;
    }

    try {
      setPostingToLinkedIn(true);
      setError("");

      const res = await axios.post(`${API_BASE_URL}/linkedin/post`, {
        token: linkedinToken,
        content: generatedPost,
      });

      if (res.data.success) {
        alert("✅ Post shared on LinkedIn!");
        // Optionally clear the generated post after successful posting
        // setGeneratedPost("");
      }
    } catch (error) {
      console.error(
        "Error posting to LinkedIn:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.error ||
          "Failed to post on LinkedIn. Please try again."
      );
    } finally {
      setPostingToLinkedIn(false);
    }
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchNews();
    }
  };

  const styles = {
    container: {
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      minHeight: "100vh",
    },
    header: {
      textAlign: "center",
      color: "#333",
      marginBottom: "2rem",
    },
    loginSection: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    loginButton: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#0077b5",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px",
    },
    connectedStatus: {
      color: "#28a745",
      fontWeight: "bold",
    },
    searchSection: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap",
    },
    input: {
      padding: "0.75rem",
      width: "300px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "16px",
    },
    button: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
    },
    buttonDisabled: {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
    error: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "1rem",
      borderRadius: "5px",
      marginBottom: "1rem",
      border: "1px solid #f5c6cb",
    },
    loading: {
      color: "#007bff",
      fontStyle: "italic",
    },
    articlesList: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "8px",
      marginBottom: "2rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    article: {
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #eee",
    },
    articleTitle: {
      color: "#333",
      marginBottom: "0.5rem",
    },
    articleDescription: {
      color: "#666",
      lineHeight: "1.4",
    },
    postContainer: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    generatedPost: {
      backgroundColor: "#f8f9fa",
      padding: "1rem",
      borderRadius: "5px",
      whiteSpace: "pre-wrap",
      lineHeight: "1.6",
      marginBottom: "1rem",
      border: "1px solid #e9ecef",
    },
    linkedinButton: {
      backgroundColor: "#0077b5",
      color: "white",
      padding: "0.75rem 1.5rem",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      marginRight: "1rem",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📰 AI NewsPost Generator</h1>

      <div style={styles.loginSection}>
        {!linkedinToken ? (
          <a href={`${API_BASE_URL}/auth/linkedin`} style={styles.loginButton}>
            🔐 Connect with LinkedIn
          </a>
        ) : (
          <p style={styles.connectedStatus}>✅ LinkedIn connected!</p>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button
            onClick={clearError}
            style={{
              float: "right",
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.searchSection}>
        <input
          type="text"
          value={keyword}
          placeholder="Enter keyword (e.g. AI, Climate Change, Technology)"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeywordKeyPress}
          style={styles.input}
        />
        <button
          onClick={fetchNews}
          disabled={loadingNews}
          style={{
            ...styles.button,
            ...(loadingNews ? styles.buttonDisabled : {}),
          }}
        >
          {loadingNews ? "🔄 Loading..." : "🔍 Fetch News"}
        </button>
      </div>

      {loadingNews && (
        <p style={styles.loading}>🔄 Searching for news articles...</p>
      )}

      {articles.length > 0 && (
        <div style={styles.articlesList}>
          <h2>📄 Top {articles.length} Articles:</h2>
          {articles.map((article, index) => (
            <div key={index} style={styles.article}>
              <h3 style={styles.articleTitle}>{article.title}</h3>
              <p style={styles.articleDescription}>{article.description}</p>
              <small style={{ color: "#999" }}>{article.pubDate}</small>
            </div>
          ))}

          <button
            onClick={generatePost}
            disabled={loadingPost}
            style={{
              ...styles.button,
              ...(loadingPost ? styles.buttonDisabled : {}),
              marginTop: "1rem",
            }}
          >
            {loadingPost ? "🧠 Generating..." : "✨ Generate LinkedIn Post"}
          </button>
        </div>
      )}

      {loadingPost && (
        <p style={styles.loading}>🧠 AI is crafting your post...</p>
      )}

      {generatedPost && (
        <div style={styles.postContainer}>
          <h3>📝 AI-Generated LinkedIn Post:</h3>
          <div style={styles.generatedPost}>{generatedPost}</div>

          <div>
            {linkedinToken && (
              <button
                onClick={postToLinkedIn}
                disabled={postingToLinkedIn}
                style={{
                  ...styles.linkedinButton,
                  ...(postingToLinkedIn ? styles.buttonDisabled : {}),
                }}
              >
                {postingToLinkedIn ? "🚀 Posting..." : "🚀 Post to LinkedIn"}
              </button>
            )}

            <button
              onClick={generatePost}
              disabled={loadingPost}
              style={{
                ...styles.button,
                backgroundColor: "#28a745",
                ...(loadingPost ? styles.buttonDisabled : {}),
              }}
            >
              🔄 Regenerate Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
