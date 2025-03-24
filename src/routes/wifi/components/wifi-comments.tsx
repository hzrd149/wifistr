import { NostrEvent } from "nostr-tools";
import { createSignal, from, For, onMount, createEffect } from "solid-js";
import { CommentBlueprint } from "applesauce-factory/blueprints";

import { asyncAction } from "../../../helpers/async-action";
import { factory } from "../../../services/actions";
import { publish } from "../../../services/nostr";
import { queryStore } from "../../../services/stores";
import { CommentsQuery } from "applesauce-core/queries";
import UserName from "../../../components/user-name";
import { formatTimeAgo } from "../../../helpers/date";
import { commentsLoader, reactionsLoader } from "../../../services/loaders";
import { appRelays } from "../../../services/lifestyle";

function AddCommentForm(props: { parent: NostrEvent }) {
  const [content, setContent] = createSignal("");

  const submit = asyncAction(async (e: SubmitEvent) => {
    e.preventDefault();
    if (content().length === 0) return;

    const draft = await factory.create(
      CommentBlueprint,
      props.parent,
      content(),
    );

    const signed = await factory.sign(draft);
    publish(signed);

    (e.target as HTMLFormElement).reset();
  });

  if (submit.loading()) return <div>Posting...</div>;

  return (
    <form onSubmit={submit.run} class="mt-4">
      <textarea
        value={content()}
        onInput={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        class="w-full border rounded-lg p-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={submit.loading()}
      />
      <button
        type="submit"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        disabled={submit.loading()}
      >
        Post Comment
      </button>
    </form>
  );
}

function Comment(props: { comment: NostrEvent; level?: number }) {
  const replies = from(queryStore.createQuery(CommentsQuery, props.comment));
  const lvl = props.level || 0;

  return (
    <>
      <div class={`border-b pb-3 pl-${lvl}rem`}>
        <div class="flex justify-between">
          <span class="font-medium">
            <UserName pubkey={props.comment.pubkey} />
          </span>
          <span class="text-sm text-gray-500">
            {formatTimeAgo(props.comment.created_at)}
          </span>
        </div>
        <p class="mt-1 text-gray-700">{props.comment.content}</p>
      </div>

      <For each={replies()}>
        {(comment) => <Comment comment={comment} level={lvl + 1} />}
      </For>
    </>
  );
}

export default function WifiComments(props: { wifi: NostrEvent }) {
  const comments = from(queryStore.createQuery(CommentsQuery, props.wifi));

  // load the comments and reactions
  const relays = from(appRelays);
  createEffect(() => {
    commentsLoader.next({
      value: props.wifi.id,
      relays: relays(),
    });
    reactionsLoader.next({
      value: props.wifi.id,
      relays: relays(),
    });
  });

  return (
    <div>
      <h2 class="text-xl font-semibold mb-4">Comments</h2>

      {/* Comment List */}
      <div class="space-y-4 mb-6">
        <For each={comments()}>
          {(comment) => <Comment comment={comment} />}
        </For>
      </div>

      <AddCommentForm parent={props.wifi} />
    </div>
  );
}
