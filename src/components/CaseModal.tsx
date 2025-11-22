import { MissingCase } from "@/types/case";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Phone, Mail, Clock, AlertCircle, QrCode, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CaseCard } from "./CaseCard";
import CaseChat from "./CaseChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface CaseModalProps {
  caseData: MissingCase;
  onClose: () => void;
  similarCases: MissingCase[];
}

export const CaseModal = ({ caseData, onClose, similarCases }: CaseModalProps) => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = caseData.qrCodeLink || `${window.location.origin}/case/${caseData.id}`;

  const handleShareCase = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help find ${caseData.fullName}`,
          text: `Please help find ${caseData.fullName}, missing since ${caseData.lastSeenDate}`,
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

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setSubscribing(true);
    const { error } = await supabase.from("case_subscribers").insert({
      case_id: caseData.id,
      email: email,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed to this case");
      } else {
        toast.error("Failed to subscribe");
      }
    } else {
      toast.success("Successfully subscribed to case updates!");
      setEmail("");
    }
    setSubscribing(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Case Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="md:col-span-1">
              {caseData.photoUrl ? (
                <img
                  src={caseData.photoUrl}
                  alt={caseData.fullName}
                  className="w-full h-64 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{caseData.fullName}</h2>
                <div className="flex gap-2 mb-4">
                  <Badge className={getPriorityColor(caseData.priority)}>
                    {caseData.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(caseData.status)}>
                    {caseData.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {caseData.age} years old • {caseData.gender} • Case ID: {caseData.id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Last Seen</p>
                    <p className="text-sm text-muted-foreground">{caseData.lastSeenLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {caseData.lastSeenDate} at {caseData.lastSeenTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Contact</p>
                    <p className="text-sm text-muted-foreground">{caseData.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <p className="text-sm text-muted-foreground break-all">{caseData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-4 rounded-xl space-y-3">
            <div>
              <h3 className="font-semibold mb-1">Clothing Description</h3>
              <p className="text-sm text-muted-foreground">{caseData.clothesDescription}</p>
            </div>
            {caseData.physicalMarks && (
              <div>
                <h3 className="font-semibold mb-1">Physical Marks</h3>
                <p className="text-sm text-muted-foreground">{caseData.physicalMarks}</p>
              </div>
            )}
          </div>

          {/* Optional Details */}
          {(caseData.healthNotes || caseData.lastOnlineActivity || caseData.recoveredBelongings || 
            caseData.knownRoutes || caseData.communityContacts || caseData.cctvFootageInfo || 
            caseData.socialMediaLinks) && (
            <div className="glass-card p-4 rounded-xl space-y-3">
              <h3 className="font-semibold text-lg mb-2">Additional Information</h3>
              
              {caseData.healthNotes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Health Notes</h4>
                  <p className="text-sm text-muted-foreground">{caseData.healthNotes}</p>
                </div>
              )}
              
              {caseData.lastOnlineActivity && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Last Online Activity</h4>
                  <p className="text-sm text-muted-foreground">{caseData.lastOnlineActivity}</p>
                </div>
              )}
              
              {caseData.recoveredBelongings && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Recovered Belongings</h4>
                  <p className="text-sm text-muted-foreground">{caseData.recoveredBelongings}</p>
                </div>
              )}
              
              {caseData.knownRoutes && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Known Routes & Hangout Spots</h4>
                  <p className="text-sm text-muted-foreground">{caseData.knownRoutes}</p>
                </div>
              )}
              
              {caseData.communityContacts && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Community Contacts</h4>
                  <p className="text-sm text-muted-foreground">{caseData.communityContacts}</p>
                </div>
              )}
              
              {caseData.cctvFootageInfo && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">CCTV Footage Information</h4>
                  <p className="text-sm text-muted-foreground">{caseData.cctvFootageInfo}</p>
                </div>
              )}
              
              {caseData.socialMediaLinks && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Social Media</h4>
                  <p className="text-sm text-muted-foreground">{caseData.socialMediaLinks}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Case Timeline
            </h3>
            <div className="space-y-3">
              {caseData.updates.map((update, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1 glass-card p-3 rounded-lg">
                    <p className="text-sm font-semibold">{update.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(update.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code & Share */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Share This Case</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQR ? "Hide" : "Show"} QR
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareCase}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            {showQR && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG value={shareUrl} size={200} />
                <p className="text-xs text-center text-muted-foreground mt-2">Scan to view case details</p>
              </div>
            )}
          </div>

          {/* Contact Button */}
          <Button className="w-full" size="lg" asChild>
            <a href={`tel:${caseData.contactNumber}`}>
              <Phone className="w-4 h-4 mr-2" />
              Contact Guardian
            </a>
          </Button>

          {/* Subscribe to Updates */}
          <div className="glass-card p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Get Case Updates</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe to receive email notifications when there are updates about this case
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
              <Button onClick={handleSubscribe} disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>

          {/* Chat Section */}
          <div>
            <h3 className="font-semibold mb-4">Discussion</h3>
            <CaseChat caseId={caseData.id} />
          </div>

          {/* Similar Cases */}
          {similarCases.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Similar Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarCases.map((similarCase) => (
                  <CaseCard
                    key={similarCase.id}
                    caseData={similarCase}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
