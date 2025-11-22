import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Phone, Mail, ArrowLeft, Share2, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CaseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCase();
  }, [id]);

  useEffect(() => {
    // Auto-download PDF if download parameter is present
    if (searchParams.get('download') === 'pdf' && caseData && posterRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        downloadPoster();
      }, 1000);
    }
  }, [searchParams, caseData]);

  const fetchCase = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error("Error fetching case:", error);
      toast.error("Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help find ${caseData.full_name}`,
          text: `Please help find ${caseData.full_name}, missing since ${caseData.last_seen_date}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const shareOnWhatsApp = () => {
    const text = `🚨 Help find ${caseData.full_name}! ${caseData.age} years old, last seen at ${caseData.last_seen_location} on ${caseData.last_seen_date}. ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `🚨 Help find ${caseData.full_name}! ${caseData.age} years old, last seen at ${caseData.last_seen_location}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;

    try {
      toast.loading("Generating PDF poster...");
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 1600
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`missing-person-${caseData.full_name.replace(/\s+/g, '-')}.pdf`);
      
      toast.dismiss();
      toast.success("Poster downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "found":
        return "bg-success text-success-foreground";
      case "active":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Case Not Found</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Action Buttons - Not in PDF */}
        <div className="flex flex-wrap gap-2 mb-6 print:hidden">
          <Button onClick={downloadPoster} variant="default">
            <Download className="w-4 h-4 mr-2" />
            Download Poster
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={shareOnWhatsApp} variant="outline" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0">
            <FaWhatsapp className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button onClick={shareOnFacebook} variant="outline" className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-0">
            <FaFacebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
          <Button onClick={shareOnTwitter} variant="outline" className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-0">
            <FaTwitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>
        </div>

        {/* PDF Poster Content */}
        <div ref={posterRef} className="bg-white rounded-2xl overflow-hidden" style={{ width: '1200px', height: '1600px' }}>
          {/* Header - Red Alert Bar */}
          <div className="bg-red-600 text-white p-8 text-center">
            <h1 className="text-6xl font-bold mb-2">MISSING PERSON</h1>
            <p className="text-2xl">Please Help Us Find {caseData.full_name}</p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="flex h-[calc(100%-140px)]">
            {/* Left Column - Photo */}
            <div className="w-1/2 p-8 flex flex-col items-center justify-start bg-gray-50">
              {caseData.photo_url ? (
                <img
                  src={caseData.photo_url}
                  alt={caseData.full_name}
                  className="w-full h-[600px] object-cover rounded-lg shadow-lg mb-6"
                />
              ) : (
                <div className="w-full h-[600px] bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center mb-6">
                  <AlertCircle className="w-32 h-32 text-gray-600" />
                </div>
              )}
              
              {/* QR Code - Explicitly ensure visibility */}
              <div className="bg-white p-6 rounded-lg shadow-lg text-center border-2 border-gray-200">
                <p className="text-2xl font-bold mb-4 text-gray-900">Scan for Case Details</p>
                <div className="bg-white p-6 rounded-xl inline-block border-4 border-red-600 shadow-md">
                  <QRCodeSVG 
                    value={`${window.location.origin}/case/${id}?download=pdf`}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-base mt-3 text-gray-600 font-medium">Scan to report sighting</p>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="w-1/2 p-8 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-4xl font-bold mb-4 text-gray-800">{caseData.full_name}</h2>
                <div className="space-y-2 text-xl text-gray-700">
                  <p><strong>Age:</strong> {caseData.age} years old</p>
                  <p><strong>Gender:</strong> {caseData.gender}</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-4 py-2 rounded-full text-base font-semibold ${getPriorityColor(caseData.priority)}`}>
                      {caseData.priority?.toUpperCase()}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-base font-semibold ${getStatusColor(caseData.status)}`}>
                      {caseData.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Seen Information */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Last Seen</h3>
                <div className="space-y-2 text-lg text-gray-700">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span><strong>Location:</strong> {caseData.last_seen_location}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span><strong>Date & Time:</strong> {caseData.last_seen_date} at {caseData.last_seen_time}</span>
                  </p>
                </div>
              </div>

              {/* Physical Description */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Description</h3>
                <div className="space-y-2 text-lg text-gray-700">
                  <p><strong>Clothing:</strong> {caseData.clothes_description}</p>
                  {caseData.physical_marks && (
                    <p><strong>Physical Marks:</strong> {caseData.physical_marks}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-red-50 border-2 border-red-500 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-3 text-red-700">CONTACT IMMEDIATELY</h3>
                <div className="space-y-2 text-xl text-gray-800">
                  <p className="flex items-center gap-2">
                    <Phone className="w-6 h-6 text-red-600" />
                    <strong>{caseData.contact_number}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-6 h-6 text-red-600" />
                    <strong className="break-all">{caseData.email}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section - Below poster, web only */}
        <div className="glass-elevated rounded-2xl p-6 md:p-8 space-y-6 mt-6 print:hidden">
          {(caseData.health_notes || caseData.last_online_activity || caseData.recovered_belongings || 
            caseData.known_routes || caseData.community_contacts || caseData.cctv_footage_info || 
            caseData.social_media_links) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-2xl mb-4">Additional Information</h3>
              
              {caseData.health_notes && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Health Notes</h4>
                  <p className="text-muted-foreground">{caseData.health_notes}</p>
                </div>
              )}
              
              {caseData.last_online_activity && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Last Online Activity</h4>
                  <p className="text-muted-foreground">{caseData.last_online_activity}</p>
                </div>
              )}
              
              {caseData.recovered_belongings && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Recovered Belongings</h4>
                  <p className="text-muted-foreground">{caseData.recovered_belongings}</p>
                </div>
              )}
              
              {caseData.known_routes && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Known Routes & Hangout Spots</h4>
                  <p className="text-muted-foreground">{caseData.known_routes}</p>
                </div>
              )}
              
              {caseData.community_contacts && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Community Contacts</h4>
                  <p className="text-muted-foreground">{caseData.community_contacts}</p>
                </div>
              )}
              
              {caseData.cctv_footage_info && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">CCTV Footage Information</h4>
                  <p className="text-muted-foreground">{caseData.cctv_footage_info}</p>
                </div>
              )}
              
              {caseData.social_media_links && (
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold text-lg mb-2">Social Media</h4>
                  <p className="text-muted-foreground">{caseData.social_media_links}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact CTA */}
          <div className="glass-card p-6 rounded-xl text-center">
            <h3 className="font-bold text-xl mb-2">Have Information?</h3>
            <p className="text-muted-foreground mb-4">
              If you have seen this person or have any information, please contact us immediately
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href={`tel:${caseData.contact_number}`}>
                <Button size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </a>
              <a href={`mailto:${caseData.email}`}>
                <Button size="lg" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}