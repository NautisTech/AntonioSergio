"use client";

import React from "react";
import CountUp from "react-countup";

interface SingleCounterProps {
	icon?: React.ReactNode;
	number: number;
	subtitle?: React.ReactNode;
	border?: string | boolean;
	counter_2?: boolean;
}

const SingleCounter: React.FC<SingleCounterProps> = ({
	icon,
	number,
	subtitle,
	border,
	counter_2 = false,
}) => {
	const borderClass =
		typeof border === "string"
			? border
			: border === false
			? ""
			: `counter__item-border ${
					counter_2 ? "counter__item-border-2" : ""
			  }`;

	return (
		<>
			<div className="col-xxl-3 col-xl-3 col-lg-6 col-md-6 col-sm-6">
				<div
					className={`counter__item d-flex align-items-center ${borderClass}`}
				>
					<div
						className={`counter__icon ${
							counter_2 && "counter__icon-2"
						} mx-auto`}
					>
						{icon}
					</div>
					<div
						className={`counter__content ${
							counter_2 && "counter__content-2"
						}`}
					>
						<h4>
							<span className="counter">
								<CountUp end={number} duration={5} />
							</span>
							+
						</h4>
						<p>{subtitle}</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default SingleCounter;
