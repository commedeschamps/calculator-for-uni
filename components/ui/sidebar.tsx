"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const AnimatedMenuToggle = ({
  toggle,
  isOpen,
}: {
  toggle: () => void;
  isOpen: boolean;
}) => (
  <button
    onClick={toggle}
    aria-label="Toggle menu"
    className="relative z-[60] rounded-md border border-border bg-background/90 p-2 shadow-sm transition hover:bg-muted"
  >
    <motion.div animate={{ y: isOpen ? 9 : 0 }} transition={{ duration: 0.3 }}>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        className="text-foreground"
      >
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 2.5 L 22 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 12 L 22 12", opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 21.5 L 22 21.5" },
            open: { d: "M 3 2.5 L 17 16.5" },
          }}
        />
      </motion.svg>
    </motion.div>
  </button>
);

const MenuIcon = () => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <motion.line x1="3" y1="12" x2="21" y2="12" />
  </motion.svg>
);

const XIcon = () => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <motion.line x1="18" y1="6" x2="6" y2="18" />
    <motion.line x1="6" y1="6" x2="18" y2="18" />
  </motion.svg>
);

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        className="flex w-full items-center justify-between rounded-xl px-4 py-2 hover:bg-muted"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold">{title}</span>
        {open ? <XIcon /> : <MenuIcon />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface SidebarSection {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface SidebarProps {
  header: ReactNode;
  navigation: ReactNode;
  sections?: SidebarSection[];
  footer?: ReactNode;
  children: ReactNode;
  mobileTitle?: string;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

const Sidebar = ({
  header,
  navigation,
  sections = [],
  footer,
  children,
  mobileTitle = "Workspace",
  className,
  sidebarClassName,
  contentClassName,
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">{header}</div>
      <nav className="flex-1 overflow-y-auto p-4">
        {navigation}
        {sections.length > 0 ? (
          <div className="mt-4">
            {sections.map((section) => (
              <CollapsibleSection
                key={section.title}
                title={section.title}
                defaultOpen={section.defaultOpen}
              >
                {section.children}
              </CollapsibleSection>
            ))}
          </div>
        ) : null}
      </nav>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </div>
  );

  return (
    <div className={cn("flex min-h-screen gap-6", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileSidebarVariants}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed inset-0 z-50 bg-background text-foreground md:hidden",
              sidebarClassName,
            )}
          >
            {sidebarBody}
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-sm md:flex md:flex-col",
          sidebarClassName,
        )}
      >
        {sidebarBody}
      </aside>

      <div className={cn("min-w-0 flex-1", contentClassName)}>
        <div className="mb-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold">{mobileTitle}</h1>
          <AnimatedMenuToggle toggle={toggleSidebar} isOpen={isOpen} />
        </div>
        {children}
      </div>
    </div>
  );
};

export { Sidebar };
