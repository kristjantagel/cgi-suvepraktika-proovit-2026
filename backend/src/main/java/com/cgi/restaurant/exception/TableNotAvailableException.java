package com.cgi.restaurant.exception;

public class TableNotAvailableException extends RuntimeException {
    public TableNotAvailableException(String message) {
        super(message);
    }
}
