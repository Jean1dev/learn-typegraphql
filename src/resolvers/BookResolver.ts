import { PubSubEngine } from "graphql-subscriptions";
import { Resolver, Query, Mutation, Arg, Subscription, Root, PubSub, Publisher } from "type-graphql";
import { Book, BookSubs } from "../models/Book";
import { CreateBookInput } from "../inputs/CreateBookInput";
import { UpdateBookInput } from "../inputs/UpdateBookInput";

@Resolver()
export class BookResolver {

  @Subscription({ topics: "NOTIFICATIONS" })
  normalSubscription(@Root() data: Book): Book {
    return data
  }

  @Query(() => [Book])
  books() {
    return Book.find();
  }

  @Query(() => Book)
  book(@Arg("id") id: string) {
    return Book.findOne({ where: { id } });
  }

  @Mutation(() => Book)
  async createBook(
    @Arg("data") data: CreateBookInput,
    @PubSub("NOTIFICATIONS") publish: Publisher<Book>) {

    const book = Book.create(data);
    await book.save();
    await publish(book);
    return book;
  }

  @Mutation(() => Book)
  async updateBook(@Arg("id") id: string, @Arg("data") data: UpdateBookInput) {
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    Object.assign(book, data);
    await book.save();
    return book;
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg("id") id: string) {
    const book = await Book.findOne({ where: { id } });
    if (!book) throw new Error("Book not found!");
    await book.remove();
    return true;
  }
}
