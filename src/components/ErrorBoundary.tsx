'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-toss-bg px-5 dark:bg-toss-dark-bg">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-toss-dark-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-toss-error-light">
              <svg
                className="h-7 w-7 text-toss-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-[18px] font-bold text-toss-text dark:text-toss-dark-text">
              문제가 발생했어요
            </h2>
            <p className="mb-6 text-[14px] leading-relaxed text-toss-text-secondary dark:text-toss-dark-text-secondary">
              일시적인 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full rounded-2xl bg-toss-blue px-5 py-4 text-[16px] font-semibold text-white transition-transform active:scale-[0.97]"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
