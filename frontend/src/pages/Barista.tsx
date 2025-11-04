import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { aiAPI, Recipe } from '@/api/ai';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Coffee, Leaf, Send, Download, FileText, Copy, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recipe?: Recipe;
}

export default function Barista() {
  const { user } = useAuth();
  const { currentSide } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isCoffee = currentSide === 'coffee';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Hello! I'm your AI ${isCoffee ? 'Barista ☕' : 'Tea Brewer 🍵'}. I can help you create custom ${isCoffee ? 'coffee' : 'tea'} recipes! Just tell me what you're in the mood for, and I'll craft something special for you.`
      };
      setMessages([welcomeMessage]);
    }
  }, [user, isCoffee]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.getBaristaResponse(input.trim(), currentSide || 'coffee');
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        recipe: response.recipe
      };

      setMessages(prev => [...prev, assistantMessage]);
      toast.success('Recipe generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate recipe');
      console.error('AI Barista error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = (recipe: Recipe) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageWidth;
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(recipe.title, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Ingredients
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ingredients:', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      recipe.ingredients.forEach(ingredient => {
        doc.text(`• ${ingredient}`, margin + 5, y);
        y += 7;
        if (y > doc.internal.pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
      });

      y += 5;
      if (y > doc.internal.pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      // Steps
      doc.setFont('helvetica', 'bold');
      doc.text('Steps:', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      recipe.steps.forEach((step, index) => {
        doc.text(`${index + 1}. ${step}`, margin + 5, y);
        y += 7;
        if (y > doc.internal.pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
      });

      if (recipe.tips) {
        y += 5;
        if (y > doc.internal.pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Pro Tips:', margin, y);
        y += 8;
        doc.setFont('helvetica', 'italic');
        const tipsLines = doc.splitTextToSize(recipe.tips, pageWidth - 2 * margin);
        doc.text(tipsLines, margin + 5, y);
      }

      doc.save(`${recipe.title.replace(/\s+/g, '_')}.pdf`);
      toast.success('Recipe exported to PDF!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const exportToMarkdown = (recipe: Recipe) => {
    try {
      const markdown = `# ${recipe.title}\n\n## Ingredients\n\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\n## Steps\n\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${recipe.tips ? `## Pro Tips\n\n${recipe.tips}\n` : ''}`;
      
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Recipe exported to Markdown!');
    } catch (error) {
      toast.error('Failed to export Markdown');
      console.error('Markdown export error:', error);
    }
  };

  const copyToClipboard = async (recipe: Recipe) => {
    try {
      const text = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${recipe.tips ? `Pro Tips:\n${recipe.tips}` : ''}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Recipe copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy recipe');
      console.error('Copy error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Please log in to use the AI Barista</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              {isCoffee ? (
                <Coffee className="w-16 h-16 text-primary" />
              ) : (
                <Leaf className="w-16 h-16 text-primary" />
              )}
            </motion.div>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2">
            Your AI {isCoffee ? 'Barista ☕🤖' : 'Tea Brewer 🍵✨'}
          </h1>
          <p className="text-muted-foreground">
            Ask me to create custom {isCoffee ? 'coffee' : 'tea'} recipes just for you!
          </p>
        </motion.div>

        {/* Chat Container */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.recipe && (
                        <div className="mt-4 pt-4 border-t border-opacity-20">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold mb-2">Ingredients:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {message.recipe.ingredients.map((ing, i) => (
                                  <li key={i}>{ing}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold mb-2">Steps:</h4>
                              <ol className="list-decimal list-inside space-y-1">
                                {message.recipe.steps.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            {message.recipe.tips && (
                              <div>
                                <h4 className="font-bold mb-2">Pro Tips:</h4>
                                <p className="italic">{message.recipe.tips}</p>
                              </div>
                            )}
                            
                            {/* Export Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportToPDF(message.recipe!)}
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportToMarkdown(message.recipe!)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Markdown
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(message.recipe!)}
                                className="flex items-center gap-2"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Thinking...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask me to create a custom ${isCoffee ? 'coffee' : 'tea'} recipe...`}
                  className="min-h-[60px] resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="lg"
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

