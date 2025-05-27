import React from 'react';
import { Box, Container, Typography, Divider } from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../../Navbar/NavBar";
import Footer from "../Footer";



const Section = ({ title, children }) => (
  <Box mt={2}>
    <Typography variant="h5" gutterBottom fontWeight={600} color="#ffba00">
      {title}
    </Typography>
    <Typography variant="body1" color="#8e8e8e">
      {children}
    </Typography>
    <Divider sx={{ mt: 2 }} />
  </Box>
);
const TermsAndConditions = () => {
 return (
   <Box>
    <Box sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 10 }}>
        <Navbar />
      </Box>
     <Container sx={{ py: 3,pt:20 }}>
      <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
        Terms and Conditions
      </Typography>

      <Section title="General">
        The domain name www.mrfranchise.in (the “Site”) is owned and presented
        by Mr Franchise (“Company”/”we”/”us”/”our” which shall include its
        affiliates, subsidiaries, associated companies, successors, and
        assigns). These terms and conditions of the Site (“Terms”) govern the
        use of the Site and are a binding contract between the Company, the Site
        owner, and you, the user. By accessing, browsing, and/or using the Site,
        you acknowledge that you have read, understood, and agree to be bound by
        these Terms and Conditions. The services provided by the Company via the
        Site are subject to the conditions mentioned herein.{" "}
      </Section>

      <Section title="Disclaimer Notice">
        Buying a franchise is a serious undertaking. Take time to decide. We
        recommend consulting a lawyer, accountant, or franchise consultant
        experienced in franchising before committing yourself. Mr Franchise
        (www.mrfranchise.in) has relied on the organizations listed on this
        website for the accuracy of information provided concerning them. The
        Company and the Site sponsors accept no liability for the accuracy of
        any information on this Site or on other linked sites. It is your
        responsibility to satisfy yourself regarding the accuracy and
        reliability of the information supplied. The organizations named within
        this site are members, partners, and sponsors of Mr Franchise. Mr
        Franchise is not an agent of these organizations, and their membership,
        support, or sponsorship of Mr Franchise does not imply endorsement of
        these organizations or their business opportunities, products, or
        services. You and your professional advisors should make independent
        inquiries to verify all aspects of any franchise business or
        opportunity. The success of a franchise depends on many factors.
        Although Mr Franchise endeavors to scrutinize members’ initial
        compliance with the Mr Franchise Code of Practice, Mr Franchise makes no
        representations that any member you may deal with is fully compliant
        with the Code of Practice or that choosing a franchise operated by any
        of its members will guarantee business success.{" "}
      </Section>

      <Section title="Legal Disclaimer">
        In no event shall we be liable for any direct, indirect, punitive,
        incidental, special, consequential damages, or any damages whatsoever,
        including but not limited to loss of use, data, or profits, arising out
        of or in any way connected with the use of information provided on the
        Site, our performance, the delay or inability to use the Site or our
        services, or for any information, services, and related services availed
        through the Site or otherwise arising through the Site or our services.
        This applies regardless of contract, tort, negligence, strict liability,
        or otherwise, even if you have been advised of possible damages. We do
        not endorse any advertisers or their content on the web pages, and it is
        the user’s responsibility to verify the reliability and suitability of
        such. We are not responsible or liable for any consequential damages
        from users relying on advertisers’ content. Before sharing (if
        applicable) any content on the Site, ensure you have the rights to do
        so. We reserve the right to use, reproduce, and modify all content you
        submit to the Site, including comments you publish. We exercise this
        right at our discretion. All content, links, and listings within the
        Site and related sites are for informational purposes only. We make no
        warranties and are not liable for the actions or representations of any
        listed company on the Site. Seek independent advice before acting on any
        information on the Site. We take care to ensure all information provided
        is accurate but are not responsible for any loss suffered due to actions
        taken based on this information. It is the sole responsibility of
        prospective investors or Site users to obtain all documents and verify
        information independently. We are not liable for any content published
        on the Site. To report content believed to be inappropriate, please
        write to us at support@mrfranchise.in. We will address your request as
        soon as reasonably possible. All content and code are copyright © 2024,
        Mr Franchise. All Rights Reserved. We reserve the right to refuse any
        advertising or submitted information at our sole discretion. We are not
        responsible for transactions between investors and franchisors listed on
        the Site. Franchisors and investors listed on the Site are for
        information purposes only and represent neither endorsement nor
        recommendation by the Company.{" "}
      </Section>

      <Section title="Obligations">
        You must not use the Site’s services and functionality in any manner
        that damages the Site, its pages, or is unlawful, harmful, or
        fraudulent. This includes using the Site for competitive intelligence,
        reverse engineering, or copying content or functionality. You agree to
        respect other users of the Site and not interfere with their legitimate
        use of the Site and our services. You agree to indemnify us against all
        costs, claims, liabilities, demands, or expenses resulting from any
        breach of these Terms by you. We reserve the right to block access to
        the Site or delete your user account at our absolute discretion. You
        shall not publish or cause to publish any unlawful, defamatory, obscene,
        threatening, offensive, harmful, or objectionable content. You confirm
        that you are the author of any content submitted to the Site and waive
        all moral rights to be identified as the author and your copyright to
        such content. 18% GST is applicable on all transactions related to
        dotcom services. Account activation for paid services will occur upon
        payment realization, and paid clients will have access to investor
        details. Account modification requests must be emailed for processing.
        By submitting a request for information regarding any of our sponsors,
        you represent and warrant that all submitted information is accurate,
        truthful, and legally compliant. However, the Company reserves the right
        to deny service at its discretion.{" "}
      </Section>

      <Section title="Refund Policy">
        Refunds will be processed within 30 business days. A minimum of 75 days’
        notice before an event is required for cancellations; otherwise, no
        refund will be issued. Annual package deals are excluded from refund
        eligibility. Cheque payments will be refunded via cheque to the original
        payee, while credit card payments will be refunded to the original card
        used.{" "}
      </Section>

      <Section title="Advertising and Sponsorships">
        Advertisers must ensure they legally own or have authorization to use
        advertising materials submitted to the Company. Advertisements must not
        be obscene, offensive, or unlawful. The Company is committed to editing
        or correcting any errors in advertisements as notified by the advertiser
        in writing, where changes are possible. The Company holds exclusive
        rights to advertisement artwork, unless otherwise agreed upon.
        Advertisers or their agencies agree to indemnify the Company against
        claims arising from advertisement displays.{" "}
      </Section>

      <Section title="Governing Law">
        The Terms are governed by Indian law, with exclusive jurisdiction in
        Delhi. Users agree to indemnify and hold the Site and Company, including
        its affiliates, officers, and employees, harmless from any third-party
        claims arising from users’ conduct on the Site. The Site reserves the
        right to disclose user information if it believes such action is
        necessary for compliance, protecting rights, or enforcing Terms.{" "}
      </Section>

      <Section title="Variation">
        We may update these Terms without notice. Continued use of the Site
        implies acceptance of any changes.
      </Section>

      <Section title="Contact Information">
        For privacy concerns or further questions, please email us at
        support@mrfranchise.in. Thank you for visiting www.mrfranchise.in.{" "}
      </Section>

      <Section title="About Mr Franchise">
        Mr Franchise is a seasoned franchise development consultant with over 25
        years of expertise in sales, marketing, and business development. With 5
        years of specialized experience in the franchise industry, Mr Franchise
        has successfully guided businesses in expanding through franchise
        models, helping them scale while maintaining brand integrity. His deep
        understanding of market trends, customer behavior, and strategic growth
        enables him to tailor franchise solutions that maximize profitability
        and long-term success. From developing franchise strategies to
        recruiting top franchisees, Mr Franchise is dedicated to empowering
        businesses to thrive in competitive markets.{" "}
      </Section>

      <Section title="Services Offered">
        <ul>
          <li>Franchise Business Consulting</li>
          <li>Franchise Marketing</li>
          <li>Franchise Recruitment</li>
          <li>Franchise Operational Consulting</li>
        </ul>
      </Section>

      {/* <Typography
        variant="body2"
        color="text.disabled"
        mt={4}
        sx={{ textAlign: "center" }}
      >
        © 2024 Mr Franchise. All rights reserved.
      </Typography> */}
    </Container>
    <Box><Footer/></Box>
   </Box>
  );
}

export default TermsAndConditions