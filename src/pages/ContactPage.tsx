import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Shield } from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'open',
        }]);

      if (error) throw error;

      toast({
        title: 'Message Sent!',
        description: 'Our support team will get back to you within 24 hours.',
      });

      setFormData({ name: '', email: user?.email || '', subject: '', message: '' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@socialmarket.com', href: 'mailto:support@socialmarket.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: Clock, label: 'Hours', value: 'Mon-Fri 9AM-6PM EST' },
    { icon: MapPin, label: 'Location', value: 'New York, NY, USA' },
  ];

  const supportFeatures = [
    { icon: Headphones, title: '24/7 Support', description: 'Our team is available around the clock to help you.' },
    { icon: MessageCircle, title: 'Live Chat', description: 'Get instant answers through our live chat system.' },
    { icon: Shield, title: 'Secure & Private', description: 'Your information is always safe with us.' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-12 lg:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Contact Support
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Have questions or need help? Our dedicated support team is here to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-8 lg:py-12 bg-card">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {supportFeatures.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4 p-4 sm:p-6 rounded-lg border border-border bg-background">
                <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-8 lg:py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        {href ? (
                          <a 
                            href={href} 
                            className="font-medium text-foreground hover:text-primary transition-colors text-sm sm:text-base"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="font-medium text-foreground text-sm sm:text-base">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FAQ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">How long does delivery take?</h4>
                    <p className="text-sm text-muted-foreground">Usually within 24 hours after payment approval.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Is my payment secure?</h4>
                    <p className="text-sm text-muted-foreground">Yes, all payments are verified before processing.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Can I get a refund?</h4>
                    <p className="text-sm text-muted-foreground">Refunds are available if the account doesn't match description.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
