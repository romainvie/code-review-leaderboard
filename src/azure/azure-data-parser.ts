import { NoteType } from "../shared/note-type.enum";
import { PullRequestNote } from "../shared/pull-request-note.model";
import { PullRequest } from "../shared/pull-request.model";
import { Commit } from "../shared/commit.model";
import { Push } from "../shared/push.model";

import { AzureComment, AzureCommit, AzurePush, AzurePullRequest, AzurePullRequestNote } from "./azure-models";

export const parseAzurePullRequestData = (data: AzurePullRequest[]): PullRequest[] => {
    return data.map((pr) => new PullRequest(pr.createdBy.displayName));
};

export const parseAzureCommitData = (data: AzureCommit[]): Commit[] => {
    return data.map((c) => new Commit(c.committer.name));
};

export const parseAzurePushData = (data: AzurePush[]): Push[] => {
    return data.map((c) => new Push(c.pushedBy.displayName));
};

const approvalRegex = /[a-zA-Z ]+ voted [0-9]+/;

const determineNoteType = (data: AzureComment): NoteType => {
    if (data.commentType === "text") {
        return NoteType.Comment;
    } else if (data.content.match(approvalRegex)) {
        return NoteType.Approval;
    } else {
        return NoteType.Unknown;
    }
};

export const parseAzurePullRequestNoteData = (threads: AzurePullRequestNote[]): PullRequestNote[] => {
    const pullRequestNotes: PullRequestNote[] = [];

    for (const thread of threads) {
        for (const comment of thread.comments) {
            const note = new PullRequestNote(comment.author.displayName, determineNoteType(comment));
            if (note.noteType === NoteType.Approval || note.noteType === NoteType.Comment) {
                pullRequestNotes.push(note);
            }
        }
    }

    return pullRequestNotes;
};
