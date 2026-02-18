import { Collapse } from "antd";
import React from "react";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { useGetFaqQuery } from "../../Pages/redux/api/metaApi";

const Faq = () => {
  const { data: faqData, isLoading, error } = useGetFaqQuery();

  // Map FAQ data to Collapse items
  const items = faqData?.data?.map((faq, index) => ({
    key: faq._id || String(index + 1),
    label: faq.question,
    children: <p className="text-[#666] leading-relaxed">{faq.description}</p>,
  })) || [];

  return (
    <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-16 animate-fadeInUp">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-[#D4872D] text-xs font-semibold uppercase tracking-widest mb-3">
            Support
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#5A5A5A] mt-3 text-base max-w-lg mx-auto">
            Everything you need to know about managing your RV with My RV Vault.
          </p>
        </div>

        {isLoading && <p className="text-[#5A5A5A] text-center">Loading FAQs...</p>}
        {error && <p className="text-red-500 text-center">Error loading FAQs: {error?.data?.message || "Something went wrong"}</p>}
        {!isLoading && items.length === 0 && <p className="text-[#5A5A5A] text-center">No FAQs available.</p>}

        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] overflow-hidden">
            <Collapse
              ghost
              items={items}
              expandIconPosition="right"
              expandIcon={({ isActive }) =>
                isActive ? (
                  <FaMinusCircle style={{ fontSize: "18px", color: "#D4872D" }} />
                ) : (
                  <FaPlusCircle style={{ fontSize: "18px", color: "#D4872D" }} />
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Faq;
