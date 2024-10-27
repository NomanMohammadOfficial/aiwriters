import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, FileText, Edit3, CheckCircle, Loader2 } from 'lucide-react';

const SEOTool = () => {
  const [step, setStep] = useState(1);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [titles, setTitles] = useState([]);
  const [outlines, setOutlines] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSitemapSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemapUrl })
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setTitles(data.titles.filter(title => title !== null));
      setStep(2);
    } catch (error) {
      setError(error.message || 'Error fetching titles');
    }
    setLoading(false);
  };

  const handleGenerateOutlines = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get-outlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles: selectedTitles })
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setOutlines(data.outlines);
      setStep(3);
    } catch (error) {
      setError(error.message || 'Error generating outlines');
    }
    setLoading(false);
  };

  const handleGenerateContent = async (outline) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline })
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setContent(data.content);
    } catch (error) {
      setError(error.message || 'Error generating content');
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Step 1: Enter Competitor's Sitemap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Enter sitemap URL (e.g., https://example.com/sitemap.xml)"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
          />
          <Button 
            onClick={handleSitemapSubmit} 
            disabled={!sitemapUrl || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Analyze Sitemap'
            )}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Step 2: Select Titles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {titles.map((title, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <input
                type="checkbox"
                checked={selectedTitles.includes(title)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTitles([...selectedTitles, title]);
                  } else {
                    setSelectedTitles(selectedTitles.filter(t => t !== title));
                  }
                }}
                className="w-4 h-4"
              />
              <p>{title}</p>
            </div>
          ))}
          {titles.length > 0 && (
            <Button 
              onClick={handleGenerateOutlines}
              disabled={selectedTitles.length === 0 || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Outlines...
                </>
              ) : (
                <>
                  Generate Outlines
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Step 3: Outlines and Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {outlines.map((item, index) => (
            <Card key={index} className="p-4">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <Textarea 
                value={item.outline} 
                readOnly 
                className="mb-4 h-40"
              />
              <Button 
                onClick={() => handleGenerateContent(item.outline)}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  'Generate Content'
                )}
              </Button>
              {content && index === outlines.length - 1 && (
                <Textarea 
                  value={content}
                  readOnly
                  className="mt-4 h-60"
                />
              )}
            </Card>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {stepNumber}
          </div>
        ))}
      </div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default SEOTool;