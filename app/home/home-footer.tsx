import { ContactTrigger } from "../contact-modal";

export function HomeFooter() {
  return <footer className="home-footer"><strong className="footer-name">SUCHAY.</strong><ContactTrigger className="footer-email">suchayjanbandhu@gmail.com <span aria-hidden="true">↗</span></ContactTrigger><nav aria-label="Footer navigation"><a href="/resume">Résumé</a><a href="https://github.com/suchayj" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/suchay-janbandhu-9a014779/" target="_blank" rel="noopener noreferrer">LinkedIn</a></nav><span className="footer-copyright">© {new Date().getFullYear()} Suchay Janbandhu</span><small className="footer-attribution">Third-party names and trademarks remain the property of their respective owners. They are used only to identify portfolio context; no sponsorship or endorsement is implied.</small></footer>;
}
