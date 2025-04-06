import React, { useState, useEffect, useRef } from "react";
import { Card, Spinner, Form, Button } from "react-bootstrap";
import { FaRobot, FaDownload } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "./Home.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const genAI = new GoogleGenerativeAI("AIzaSyAIB1mn4cyFqnJ77WTPWSC_03B1cmgQfoA");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [fullReport, setFullReport] = useState("");

  const [companyShare, setCompanyShare] = useState("");
  const [shareType, setShareType] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentYears, setInvestmentYears] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("medium");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [combinedQuery, setCombinedQuery] = useState("");

  useEffect(() => {
    const query = `
        Investment Plan Request for: ${companyShare}
        Type of Share: ${shareType}
        Investment Strategy: ${investmentType}
        Duration: ${investmentYears} years
        Risk Tolerance: ${riskAppetite}
        Investment Amount: ${investmentAmount || "To be determined"}
        `;
    setCombinedQuery(query);
  }, [
    companyShare,
    shareType,
    investmentType,
    investmentYears,
    riskAppetite,
    investmentAmount,
  ]);

  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!companyShare || !shareType || !investmentType || !investmentYears) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Please fill all required fields (Company Share, Share Type, Investment Type, Investment Years)",
          isAI: true,
        },
      ]);
      return;
    }

    setIsLoading(true);

    const prompt = `As a financial expert, analyze this investment plan:
        ${combinedQuery}

        Provide a detailed response with:
        1. Current market position of ${companyShare}
        2. Price evaluation (high/low compared to sector average)
        3. Risk vs reward analysis
        4. Recommended portfolio allocation
        5. 5-year historical performance
        6. Alternative investment options
        7. Tax optimization strategies

        Conclude with a summary and a recommendation on whether this is a suitable investment.`;

    try {
      setMessages((prev) => [
        ...prev,
        {
          text: `**Investment Plan Request:**\n\`\`\`${combinedQuery}\`\`\``,
          isAI: false,
        },
      ]);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { text, isAI: true }]);
      setFullReport(text);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "🚨 Error generating analysis. Please try again.",
          isAI: true,
        },
      ]);
      setFullReport("Error generating analysis.");
    } finally {
      setIsLoading(false);
      setCompanyShare("");
      setShareType("");
      setInvestmentType("");
      setInvestmentYears("");
      setRiskAppetite("medium");
      setInvestmentAmount("");
    }
  };

  const downloadReport = () => {
    if (!fullReport) {
      alert("No report generated yet.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Investment Analysis Report", 10, 10);
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(
      fullReport,
      pdf.internal.pageSize.getWidth() - 20
    );
    pdf.text(splitText, 10, 20);
    pdf.save("investment_analysis_report.pdf");
  };

  return (
    <div className="finance-ai-container">
      <Card className="ai-chat-section">
        <Card.Body>
          <div className="ai-chat-messages" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-container ${
                  msg.isAI ? "ai-message" : "user-message"
                }`}
              >
                <div
                  className={`message ${
                    msg.isAI ? "ai-message" : "user-message"
                  }`}
                >
                  {msg.isAI && <FaRobot className="ai-icon" />}
                  <div className="message-content">
                    <ReactMarkdown
                      children={msg.text}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              children={String(children).replace(/\n$/, "")}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-container ai-message">
                <div className="message ai-message">
                  <FaRobot className="ai-icon" />
                  <div className="message-content">
                    <Spinner animation="border" size="sm" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="investment-details-form">
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                value={companyShare}
                onChange={(e) => setCompanyShare(e.target.value)}
                placeholder="Company Share Name (e.g., TCS, Infosys)"
              />
            </Form.Group>

            <div className="row mb-3">
              <div className="col">
                <Form.Control
                  type="text"
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value)}
                  placeholder="Share Type (Stocks, Bonds, ETFs)"
                />
              </div>
              <div className="col">
                <Form.Control
                  type="text"
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  placeholder="Investment Type (Growth, Dividend)"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <Form.Control
                  type="number"
                  value={investmentYears}
                  onChange={(e) => setInvestmentYears(e.target.value)}
                  placeholder="Investment Years"
                />
              </div>
              <div className="col">
                <Form.Select
                  value={riskAppetite}
                  onChange={(e) => setRiskAppetite(e.target.value)}
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </Form.Select>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Investment Amount (₹)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                value={combinedQuery}
                onChange={(e) => setCombinedQuery(e.target.value)}
                rows={4}
                placeholder="Edit your combined investment query here..."
                className="combined-query-box"
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center">
              <Button
                className="ai-send-button"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing Investment..." : "Get Full Analysis"}
              </Button>
              {fullReport && (
                <Button
                  className="report-download-button"
                  onClick={downloadReport}
                  disabled={isLoading}
                >
                  <FaDownload className="mr-2" /> Download Report
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
        <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "1rem" }}>
          ⚠️ Disclaimer: This AI may make mistakes. Investment and market
          decisions are subject to risks. Please verify all information on
          official sources before making any decisions.
        </p>
      </Card>
    </div>
  );
};

export default Home;
