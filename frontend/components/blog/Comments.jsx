"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function Comments({
	comments = [],
	onReply,
	language = "pt",
	isDark = false,
}) {
	const [replyingTo, setReplyingTo] = useState(null);

	const translations = {
		reply: {
			pt: "Responder",
			en: "Reply",
		},
		guest: {
			pt: "Visitante",
			en: "Guest",
		},
	};

	const formatDate = dateString => {
		const date = new Date(dateString);
		if (language === "pt") {
			return date.toLocaleDateString("pt-PT", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleReplyClick = commentId => {
		setReplyingTo(replyingTo === commentId ? null : commentId);
		if (onReply) {
			onReply(commentId);
		}
	};

	// Get only top-level comments (without parentId)
	const topLevelComments = comments.filter(c => !c.parentId);

	// Function to get replies for a comment
	const getReplies = commentId => {
		return comments.filter(c => c.parentId === commentId);
	};

	const renderComment = (comment, isReply = false) => {
		const replies = getReplies(comment.id);
		const avatarSrc = "/assets/images/user-avatar.png"; // Default avatar
		const authorName =
			comment.authorName ||
			comment.author_name ||
			translations.guest[language];

		return (
			<li
				key={comment.id}
				className={`media comment-item ${isReply ? "children" : ""}`}
			>
				<a className="float-start" href="#">
					<Image
						className="media-object comment-avatar"
						src={avatarSrc}
						alt={authorName}
						width={50}
						height={50}
					/>
				</a>
				<div className="media-body">
					<div className="comment-item-data">
						<div
							className={`comment-author ${isDark ? "text-white" : ""}`}
						>
							<a href="#" className={isDark ? "text-white" : ""}>
								{authorName}
							</a>
						</div>
						<span className={isDark ? "text-gray" : ""}>
							{formatDate(comment.created_at)}
						</span>{" "}
						<span className="separator">—</span>
						<a
							href="#"
							onClick={e => {
								e.preventDefault();
								handleReplyClick(comment.id);
							}}
							className={isDark ? "text-white" : ""}
						>
							<i className="fa fa-comment" />
							&nbsp;{translations.reply[language]}
						</a>
					</div>
					<p className={isDark ? "text-gray-light" : ""}>{comment.text}</p>

					{/* Render replies recursively */}
					{replies.length > 0 && (
						<ul className="children">
							{replies.map(reply => renderComment(reply, true))}
						</ul>
					)}
				</div>
			</li>
		);
	};

	if (comments.length === 0) {
		return null;
	}

	return (
		<ul className="media-list comment-list clearlist">
			{topLevelComments.map(comment => renderComment(comment))}
		</ul>
	);
}
