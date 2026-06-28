import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiInfo, FiX } from "react-icons/fi";

function InfoTour({ steps }) {
    const [open, setOpen] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    if (!steps || steps.length === 0) {
        return null;
    }

    const currentStep = steps[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === steps.length - 1;

    const close = () => {
        setOpen(false);
        setStepIndex(0);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white shadow transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Deschide ghidul paginii"
            >
                <FiInfo size={20} />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-6">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-teal-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                                    Pasul {stepIndex + 1} din {steps.length}
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-gray-900">
                                    {currentStep.title}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={close}
                                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                aria-label="Inchide ghidul"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            {currentStep.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setStepIndex(index => Math.max(0, index - 1))}
                                disabled={isFirst}
                                className="inline-flex items-center gap-2 rounded-xl border border-teal-100 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft />
                                Inapoi
                            </button>

                            <div className="flex gap-1">
                                {steps.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`h-2 w-2 rounded-full ${index === stepIndex ? "bg-teal-500" : "bg-gray-200"}`}
                                    />
                                ))}
                            </div>

                            {isLast ? (
                                <button
                                    type="button"
                                    onClick={close}
                                    className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-teal-600"
                                >
                                    Inchide
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setStepIndex(index => Math.min(steps.length - 1, index + 1))}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-teal-600"
                                >
                                    Mai departe
                                    <FiChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default InfoTour;
