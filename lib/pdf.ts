import { jsPDF } from "jspdf";
import { AnalysisResult } from "@/lib/types";

export function exportAnalysisPdf(result: AnalysisResult) {
  const doc = new jsPDF();
  const margin = 16;
  let y = 18;

  const addSection = (title: string, body: string | string[]) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const lines = Array.isArray(body) ? body.map((line, index) => `${index + 1}. ${line}`) : [body];
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 178);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 6;
    });
    y += 4;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ConvoLens Analysis Report", margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 10;

  addSection("Summary", result.summary);
  addSection("Sentiment", `${result.sentiment_label} (${result.sentiment_score}/100)`);
  addSection("Conversation Type", result.conversation_type);
  addSection("Emotion Tags", result.emotion_tags.join(", "));
  addSection("Positives", result.positives);
  addSection("Negatives", result.negatives);
  addSection("Topics", result.key_topics);
  addSection("Action Items", result.action_items);
  addSection("Notable Quotes", result.notable_quotes);
  addSection("Next Steps", result.next_steps);

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Speaker Breakdown", margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.text("Name", margin, y);
  doc.text("Tone", 70, y);
  doc.text("Messages", 120, y);
  doc.text("Contribution", 150, y);
  y += 6;
  doc.setFont("helvetica", "normal");

  result.speakers.forEach((speaker) => {
    const contributionLines = doc.splitTextToSize(speaker.key_contribution, 48);
    doc.text(speaker.name, margin, y);
    doc.text(speaker.tone, 70, y);
    doc.text(String(speaker.message_count), 120, y);
    doc.text(contributionLines, 150, y);
    y += Math.max(8, contributionLines.length * 6);
  });

  doc.save("convolens-analysis-report.pdf");
}

