import React, { useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import profile from "../../assets/Home/re.jpg";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
import { MdStar } from "react-icons/md";
import { HiArrowNarrowLeft, HiArrowNarrowRight } from "react-icons/hi";

const Review = () => {
  const category = [
    {
      title: "Guy Hawkins",
      location: "Financial Advisor",
      review:
        "\u201CSuper smooth experience listing my business \u2014 found a serious buyer in just two weeks!\u201D",
      img: profile,
    },
    {
      title: "Theresa Webb",
      location: "Chief Executive Officer.",
      review:
        "\u201CHighly recommend BFS! It made the complex process of selling my business feel effortless.\u201D",
      img: profile,
    },
    {
      title: "Arlene McCoy",
      location: "Certified Financial Planner",
      review:
        "\u201CThe platform is easy to use, professional, and helped me close a great deal fast.\u201D",
      img: profile,
    },
    {
      title: "Earings",
      location: "New York, USA",
      review:
        "I was looking for the perfect engagement ring, and this website exceeded all my expectations! The craftsmanship is stunning, and the diamond sparkles beautifully. My fianc\u00E9e absolutely loves it, and I couldn\u2019t be happier with my purchase!",
      img: profile,
    },
    {
      title: "Necklaces",
      location: "New York, USA",
      review:
        "I was looking for the perfect engagement ring, and this website exceeded all my expectations! The craftsmanship is stunning, and the diamond sparkles beautifully. My fianc\u00E9e absolutely loves it, and I couldn\u2019t be happier with my purchase!",
      img: profile,
    },
    {
      title: "Rings",
      location: "New York, USA",
      review:
        "I was looking for the perfect engagement ring, and this website exceeded all my expectations! The craftsmanship is stunning, and the diamond sparkles beautifully. My fianc\u00E9e absolutely loves it, and I couldn\u2019t be happier with my purchase!",
      img: profile,
    },
  ];

  const splideRef = useRef(null);

  const handlePrevClick = () => {
    if (splideRef.current) {
      splideRef.current.splide.go("<");
    }
  };

  const handleNextClick = () => {
    if (splideRef.current) {
      splideRef.current.splide.go(">");
    }
  };

  return (
    <div className="max-w-site mx-auto mt-11 px-4 lg:px-6 2xl:px-8 animate-fadeInUp">
      <div>
        <h1 className="text-[#3B7D3C] text-2xl font-bold">Customer Testimonials</h1>
        <p className="text-[#5A5A5A] mt-2">
          "Don't just take our word for it—hear directly from our users! Our
          customers love how RV LIFE Maintenance helps them stay organized and
          keep their RVs running smoothly. Check out their experiences below.
        </p>
      </div>
      <div className="mb-16 mt-6 bg-[#3B7D3C] p-11 rounded-2xl">
        <div className="">
         <div>
             <div className=" w-full">
            <Splide
              ref={splideRef}
              options={{
                type: "loop",
                perPage: 3,
                gap: "1rem",
                arrows: false,
                pagination: false,
                breakpoints: {
                  1724: { perPage: 3 },
                  968: { perPage: 2 },
                  640: { perPage: 1 },
                },
              }}
              aria-label="Category Slide"
              className="w-full"
            >
              {category.map((item, index) => (
                <SplideSlide key={index}>
                  <div className="shadow-lg bg-[#FFFFFF] rounded-xl p-4 py-8 hover-lift">
                    <div className=" flex pb-3 text-yellow-500">
                      <MdStar />
                      <MdStar />
                      <MdStar />
                      <MdStar />
                      <MdStar />
                      <p className="-mt-1 pl-2 text-[#5A5A5A]">(4.5)</p>
                    </div>

                    <p className="text-sm mt-1 text-[#5A5A5A]">{item.review}</p>
                    <div className="flex items-center gap-4 mt-5">
                      <div className="">
                        <img
                          className="rounded-full w-[70px] object-cover"
                          src={item.img}
                          alt={item.title}
                        />
                      </div>
                      <div>
                        <h1 className="text-[#1A1A1A] font-semibold">{item.title}</h1>
                        <h2 className="text-[#5A5A5A] text-sm">{item.location}</h2>
                      </div>
                    </div>
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          </div>

          <div className="flex gap-3 justify-center mt-4">
            <div
              className="bg-white p-2 rounded-full text-[#3B7D3C] cursor-pointer hover:shadow-md transition-shadow duration-300"
              onClick={handlePrevClick}
            >
              <div className="rounded-full text-2xl">
                <HiArrowNarrowLeft />
              </div>
            </div>

            <div
              className="bg-white p-2 rounded-full text-[#3B7D3C] cursor-pointer hover:shadow-md transition-shadow duration-300"
              onClick={handleNextClick}
            >
              <div className="rounded-full text-2xl">
                <HiArrowNarrowRight />
              </div>
            </div>
          </div>
         </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
