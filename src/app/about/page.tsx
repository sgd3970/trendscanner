'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineNewspaper, HiOutlineShoppingBag, HiOutlineChartBar, HiOutlineUserGroup } from 'react-icons/hi';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineMagnifyingGlass, HiOutlineChartBarSquare } from 'react-icons/hi2';
import { HiOutlineLightningBolt, HiOutlineBadgeCheck, HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* 메인 타이틀 & 한 줄 소개 */}
      <section className="bg-gradient-to-b from-white to-indigo-50 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-8 block">
            Welcome to TrendScanner
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 sm:mb-8 leading-tight bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
            트렌드스캐너에 오신 것을 환영합니다
          </h1>
          <p className="text-base sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            최신 트렌드와 핫한 제품 리뷰를 실시간으로 분석하고 소개하는 전문 플랫폼입니다.<br className="hidden sm:block" />
            트렌드스캐너는 빠르게 변화하는 세상을 한눈에 파악할 수 있도록 돕습니다.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-4 block text-center">
              About Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">트렌드스캐너는 어떤 서비스인가요?</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 text-center">
              트렌드스캐너는 다양한 분야의 최신 트렌드와 인기 제품 정보를 실시간으로 수집하고,<br className="hidden sm:block" />
              분석하여 사용자에게 쉽고 빠르게 전달하는 플랫폼입니다.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-center">
              뉴스, 테크, 라이프스타일, 스포츠, 쇼핑 등<br className="hidden sm:block" />
              폭넓은 주제를 다루며, 전문적인 분석을 기반으로 정확하고 신뢰할 수 있는 정보를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-4 block text-center">
            Our Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">우리가 제공하는 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-indigo-600 mb-6">
                <HiOutlineNewspaper className="w-10 h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">실시간 트렌드 뉴스</h3>
              <p className="text-base text-gray-600">국내외 주요 이슈, 신제품 출시, 핫이슈를 빠르게 전달합니다.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-indigo-600 mb-6">
                <HiOutlineShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">제품 리뷰</h3>
              <p className="text-base text-gray-600">신뢰할 수 있는 상품 리뷰를 통해 합리적인 소비를 돕습니다.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-indigo-600 mb-6">
                <HiOutlineChartBar className="w-10 h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">키워드 분석</h3>
              <p className="text-base text-gray-600">인기 키워드와 관심 급상승 주제를 분석하여 트렌드 흐름을 보여줍니다.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-indigo-600 mb-6">
                <HiOutlineUserGroup className="w-10 h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">맞춤형 추천</h3>
              <p className="text-base text-gray-600">관심사를 반영한 트렌드와 제품을 개인 맞춤형으로 추천할 예정입니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-indigo-50 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-4 block text-center">
            Our Values
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">트렌드스캐너의 가치</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="text-indigo-600 mb-6">
                <HiOutlineLightningBolt className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">신속성</h3>
              <p className="text-base text-gray-600">변화하는 트렌드를 누구보다 빠르게 제공합니다.</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="text-indigo-600 mb-6">
                <HiOutlineBadgeCheck className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">신뢰성</h3>
              <p className="text-base text-gray-600">검증된 정보만을 선별하여 제공합니다.</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="text-indigo-600 mb-6">
                <HiOutlineCube className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">접근성</h3>
              <p className="text-base text-gray-600">복잡한 정보를 한눈에 이해할 수 있도록 쉽고 직관적으로 구성합니다.</p>
            </div>
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="text-indigo-600 mb-6">
                <HiOutlineSparkles className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">혁신성</h3>
              <p className="text-base text-gray-600">키워드 기반 트렌드 분석과 AI 추천 기능을 지속적으로 개선하고 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Operate */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-4 block text-center">
            Our Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">트렌드스캐너는 이렇게 운영됩니다</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-2xl">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiOutlineClock className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">데이터 수집</h3>
                  <p className="text-base sm:text-lg text-gray-700">매일 자동화된 시스템을 통해 트렌드 및 제품 데이터를 수집합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-2xl">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiOutlineCheckCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">데이터 필터링</h3>
                  <p className="text-base sm:text-lg text-gray-700">수집된 데이터는 최신성, 정확성, 신뢰성 기준으로 필터링합니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-2xl">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiOutlineMagnifyingGlass className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">콘텐츠 검수</h3>
                  <p className="text-base sm:text-lg text-gray-700">중요 트렌드와 리뷰는 에디터의 검수 과정을 거쳐 최종 발행됩니다.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-2xl">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HiOutlineChartBarSquare className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">실시간 분석</h3>
                  <p className="text-base sm:text-lg text-gray-700">키워드 분석 시스템을 통해 '관심도 급상승' 이슈를 실시간으로 반영합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto shadow-xl">
            <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide mb-4 block text-center">
              Contact Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">문의하기</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 text-center">
              제휴 및 제안 관련 문의를 환영합니다.<br />
              아래 연락처로 문의해 주시면 빠르게 답변 드리겠습니다.
            </p>
            <div className="space-y-4 text-center">
              <p className="text-base sm:text-lg text-gray-700">
                <span className="font-semibold">이메일:</span> zbehddl@gmail.com
              </p>
              <p className="text-base sm:text-lg text-gray-700">
                <span className="font-semibold">SNS:</span> (추후 연결 예정)
              </p>
            </div>
            <div className="mt-8 text-center">
              <Link 
                href="mailto:zbehddl@gmail.com"
                className="inline-block px-6 sm:px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg"
              >
                이메일로 문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 